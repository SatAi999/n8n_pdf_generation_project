@echo off
echo Starting n8n with local command execution and file access permissions...
set N8N_ENFORCE_SETTINGS_FILE_FOR_CAN_EXECUTE_COMMAND=false
set NODES_EXCLUDE=[]
set N8N_RESTRICT_FILE_ACCESS_TO=D:\n8n_pdf;d:\n8n_pdf;C:\Users\Satwik\.n8n-files;c:\Users\Satwik\.n8n-files;D:/n8n_pdf;d:/n8n_pdf;C:/Users/Satwik/.n8n-files;c:/Users/Satwik/.n8n-files
n8n
