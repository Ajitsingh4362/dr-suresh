' start-hidden.vbs
' Silently starts the WhatsApp notifier in the background whenever
' Windows starts — no terminal window pops up, nothing to run manually.

Set objFSO = CreateObject("Scripting.FileSystemObject")
strScriptPath = objFSO.GetParentFolderName(WScript.ScriptFullName)

Set objShell = CreateObject("WScript.Shell")
objShell.Run "cmd /c cd /d """ & strScriptPath & """ && node index.js", 0, False
