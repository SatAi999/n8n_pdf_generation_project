import sqlite3
import json
import os

# Paths
db_path = r"C:\Users\Satwik\.n8n\database.sqlite"
brand_wf_path = r"D:\n8n_pdf\brand_processing_workflow.json"
complex_wf_path = r"D:\n8n_pdf\complex_workflow.json"
generate_script_path = r"D:\n8n_pdf\generate_workflow_json.js"

def update_workflow_nodes(nodes):
    updated = False
    for node in nodes:
        # 1. Update HTTP Request nodes
        if node.get("type") == "n8n-nodes-base.httpRequest":
            node_name = node.get("name", "")
            if node_name in ["Convert HTML to PDF1", "Call PDF Microservice"]:
                print(f"Updating HTTP Request node: '{node_name}'")
                params = node.setdefault("parameters", {})
                
                # Setup options.response.response
                options = params.setdefault("options", {})
                response_opt = options.setdefault("response", {})
                response_nested = response_opt.setdefault("response", {})
                
                response_nested["responseFormat"] = "file"
                
                if node_name == "Convert HTML to PDF1":
                    response_nested["outputPropertyName"] = "data"
                    params["responseData"] = "file"
                    params["responseBinaryPropertyName"] = "data"
                elif node_name == "Call PDF Microservice":
                    response_nested["outputPropertyName"] = "pdfData"
                    params["responseData"] = "file"
                    params["responseBinaryPropertyName"] = "pdfData"
                
                updated = True
        
        # 2. Update Validate PDF Response nodes (to use $binary instead of $json)
        elif node.get("type") == "n8n-nodes-base.if" and node.get("name") == "Validate PDF Response":
            params = node.setdefault("parameters", {})
            conditions = params.setdefault("conditions", {})
            string_conds = conditions.setdefault("string", [])
            for cond in string_conds:
                val1 = cond.get("value1", "")
                if "$json.pdfData.mimeType" in val1:
                    print(f"Correcting Validate PDF Response to use $binary.pdfData.mimeType")
                    cond["value1"] = "={{ $binary.pdfData.mimeType }}"
                    updated = True
                elif "$binary.pdfData.mimeType" not in val1 and "$binary.data.mimeType" not in val1:
                    # Default fallback
                    cond["value1"] = "={{ $binary.data.mimeType }}"
                    updated = True
                    
    return updated

# --- Part 1: Update Files ---
# 1. brand_processing_workflow.json
if os.path.exists(brand_wf_path):
    print(f"Updating file: {brand_wf_path}")
    with open(brand_wf_path, 'r', encoding='utf-8') as f:
        wf = json.load(f)
    if update_workflow_nodes(wf.get("nodes", [])):
        with open(brand_wf_path, 'w', encoding='utf-8') as f:
            json.dump(wf, f, indent=2)
        print("Updated brand_processing_workflow.json successfully.")

# 2. complex_workflow.json
if os.path.exists(complex_wf_path):
    print(f"Updating file: {complex_wf_path}")
    with open(complex_wf_path, 'r', encoding='utf-8') as f:
        wf = json.load(f)
    if update_workflow_nodes(wf.get("nodes", [])):
        with open(complex_wf_path, 'w', encoding='utf-8') as f:
            json.dump(wf, f, indent=2)
        print("Updated complex_workflow.json successfully.")

# 3. Update generate_workflow_json.js template
if os.path.exists(generate_script_path):
    print(f"Updating generator script: {generate_script_path}")
    with open(generate_script_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the Convert HTML to PDF1 block in the generator template
    old_block = """      "id": "http-convert-html-to-pdf",
      "name": "Convert HTML to PDF1",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [1340, 240]"""
      
    # Let's find and modify the nodes array item
    if '"id": "http-convert-html-to-pdf"' in content:
        # We can perform simple replaces for parameter properties
        content = content.replace(
            '"responseBinaryPropertyName": "pdfData",\n        "options": {}',
            '"responseBinaryPropertyName": "data",\n        "options": {\n          "response": {\n            "response": {\n              "responseFormat": "file",\n              "outputPropertyName": "data"\n            }\n          }\n        }'
        )
        with open(generate_script_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated generate_workflow_json.js template successfully.")


# --- Part 2: Update SQLite Database ---
if os.path.exists(db_path):
    print(f"Connecting to database: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, name, nodes FROM workflow_entity;")
    rows = cursor.fetchall()
    
    for row in rows:
        wf_id, wf_name, nodes_json = row
        nodes = json.loads(nodes_json)
        if update_workflow_nodes(nodes):
            print(f"Saving changes for workflow: '{wf_name}' (ID: {wf_id}) to DB")
            cursor.execute(
                "UPDATE workflow_entity SET nodes = ? WHERE id = ?;",
                (json.dumps(nodes), wf_id)
            )
            conn.commit()
            
    conn.close()
    print("Database workflows updated successfully.")
else:
    print(f"Database not found at {db_path}")
