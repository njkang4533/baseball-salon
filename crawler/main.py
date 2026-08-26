import os
import json
import requests
import xml.etree.ElementTree as ET
from openai import OpenAI
from datetime import datetime

# API Key config
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("Error: OPENAI_API_KEY is not set.")
    exit(1)

client = OpenAI(api_key=OPENAI_API_KEY)

FIREBASE_PROJECT_ID = "baseball-salon"
FIREBASE_API_KEY = "AIzaSyBc4Sjf5cof3zfNUjWkHs_oNaX_8XwccCY"

def get_firestore_documents(collection_id):
    url = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/{collection_id}?key={FIREBASE_API_KEY}"
    resp = requests.get(url)
    if resp.status_code == 200:
        return resp.json().get('documents', [])
    return []

def dict_to_firestore(d):
    fields = {}
    for k, v in d.items():
        if isinstance(v, str):
            fields[k] = {"stringValue": v}
        elif isinstance(v, int):
            fields[k] = {"integerValue": str(v)}
        elif isinstance(v, float):
            fields[k] = {"doubleValue": v}
        elif isinstance(v, bool):
            fields[k] = {"booleanValue": v}
        elif isinstance(v, list):
            fields[k] = {"arrayValue": {"values": [{"stringValue": item} for item in v]}}
    return fields

def add_firestore_document(collection_id, doc_id, data):
    url = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/{collection_id}?documentId={doc_id}&key={FIREBASE_API_KEY}"
    payload = {"fields": dict_to_firestore(data)}
    resp = requests.post(url, json=payload)
    return resp.status_code in [200, 201]

def fetch_latest_pubmed_ids(term="baseball pitching biomechanics", max_results=2):
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={term}&retmode=json&retmax={max_results}&sort=date"
    response = requests.get(url)
    data = response.json()
    return data.get("esearchresult", {}).get("idlist", [])

def fetch_pubmed_details(pubmed_id):
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id={pubmed_id}&retmode=xml"
    response = requests.get(url)
    root = ET.fromstring(response.content)
    
    article = root.find(".//Article")
    if article is None:
        return None
        
    title_elem = article.find(".//ArticleTitle")
    title = title_elem.text if title_elem is not None else "No Title"
    
    abstract_text = ""
    abstract_elems = article.findall(".//AbstractText")
    for elem in abstract_elems:
        if elem.text:
            abstract_text += elem.text + " "
            
    authors = []
    author_list = article.findall(".//Author")
    for author in author_list:
        last = author.find("LastName")
        first = author.find("ForeName")
        if last is not None and first is not None:
            authors.append(f"{first.text} {last.text}")
            
    journal_elem = article.find(".//Journal/Title")
    journal = journal_elem.text if journal_elem is not None else "Unknown Journal"

    return {
        "pubmed_id": pubmed_id,
        "title": title,
        "abstract": abstract_text.strip(),
        "authors": ", ".join(authors),
        "source": journal,
        "originalUrl": f"https://pubmed.ncbi.nlm.nih.gov/{pubmed_id}/"
    }

def summarize_with_ai(article_data):
    prompt = f"""
    You are an AI assistant helping a baseball coach. Read the following scientific paper abstract about baseball and extract useful insights.
    
    Paper Title: {article_data['title']}
    Analyze the following research abstract and extract detailed insights for baseball coaches.
    Return ONLY a JSON object (no markdown, no formatting) with this exact structure:
    {{
        "title": "Korean translation of the title",
        "summary": "논문의 배경, 연구 방법, 그리고 가장 중요한 핵심 결과(Core Finding)를 포함하여 코치들이 깊이 있게 이해할 수 있도록 2~3문단으로 상세하게 풀어서 설명해 주세요. (한국어). 문단 바꿈은 <br><br>를 사용하고, 가장 중요한 핵심 문장 1~2개에는 반드시 <span class='text-neon-lime font-bold'>태그를 씌워 강조해 주세요.",
        "coachingPoint": "A 1-2 sentence actionable takeaway for a baseball coach.",
        "applications": ["현장 적용 방법 1 (상세히)", "현장 적용 방법 2 (상세히)", "현장 적용 방법 3 (상세히)"]
    }}

    Title: {article_data['title']}
    Abstract: {article_data['abstract']}
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={ "type": "json_object" }
        )
        text = response.choices[0].message.content.strip()
        
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        result_json = json.loads(text.strip())
        
        # DALL-E 이미지 생성 제거 (사용자 직접 업로드 방식으로 변경)
        result_json['image_base64'] = ""
        
        return result_json
    except Exception as e:
        print(f"API Error: {e}")
        return {
            "title": f"[번역 대기] {article_data['title']}",
            "summary": f"번역 엔진 오류로 원문이 표시됩니다. 원문: {article_data['abstract'][:200]}...",
            "coachingPoint": "API 할당량 또는 연결 상태를 확인해 주세요.",
            "applications": []
        }

def main():
    print("Checking existing articles in Firebase...")
    existing_urls = set()
    
    # Check published articles
    published_docs = get_firestore_documents("articles")
    for doc in published_docs:
        url_field = doc.get('fields', {}).get('originalUrl', {}).get('stringValue')
        if url_field:
            existing_urls.add(url_field)
            
    # Check drafts
    draft_docs = get_firestore_documents("draftArticles")
    for doc in draft_docs:
        url_field = doc.get('fields', {}).get('originalUrl', {}).get('stringValue')
        if url_field:
            existing_urls.add(url_field)
            
    print("Fetching latest PubMed articles...")
    pmids = fetch_latest_pubmed_ids("baseball pitching biomechanics", 2)
    
    for pmid in pmids:
        original_url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
        if original_url in existing_urls:
            print(f"Article {pmid} already exists in Firebase. Skipping.")
            continue
            
        print(f"Fetching details for PMID {pmid}...")
        details = fetch_pubmed_details(pmid)
        if not details or not details['abstract']:
            print(f"No abstract found for {pmid}. Skipping.")
            continue
            
        print(f"Summarizing with AI for {pmid}...")
        ai_result = summarize_with_ai(details)
        if not ai_result:
            continue
            
        doc_id = f"draft_{int(datetime.now().timestamp())}_{pmid}"
        new_draft = {
            "type": "paper",
            "sourceType": "논문",
            "country": "US",
            "category": "바이오메카닉스",
            "title": ai_result["title"],
            "date": datetime.now().strftime("%Y. %m. %d"),
            "readTime": "3 min read",
            "coachingPoint": ai_result["coachingPoint"],
            "source": details["source"],
            "authors": details["authors"],
            "originalUrl": original_url,
            "summary": ai_result["summary"],
            "applications": ai_result["applications"],
            "image_base64": ai_result.get("image_base64", ""),
            "createdAt": int(datetime.now().timestamp() * 1000)
        }
        
        success = add_firestore_document("draftArticles", doc_id, new_draft)
        if success:
            print(f"Successfully added draft for {pmid} to Firebase.")
        else:
            print(f"Failed to add draft for {pmid} to Firebase.")

    print("Done!")

if __name__ == "__main__":
    main()
