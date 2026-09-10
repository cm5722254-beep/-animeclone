Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

strCurDir = FSO.GetParentFolderName(WScript.ScriptFullName)

' 1. Check if server is already responding on port 3000
On Error Resume Next
Set oHTTP = CreateObject("MSXML2.ServerXMLHTTP")
oHTTP.Open "GET", "http://127.0.0.1:3000/api/config", False
oHTTP.Send
bServerRunning = (oHTTP.Status = 200)
On Error GoTo 0

' 2. If not running, start server silently in background without CMD window
If Not bServerRunning Then
    WshShell.Run """" & strCurDir & "\run.bat""", 0, False
    WScript.Sleep 2500
End If

' 3. Open in Windows Native App Window Mode (No browser tabs/URL bar)
' Checks for Edge (built into 100% of Windows 10 & 11) or Chrome
strEdgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
If Not FSO.FileExists(strEdgePath) Then
    strEdgePath = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
End If

strChromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
If Not FSO.FileExists(strChromePath) Then
    strChromePath = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
End If

If FSO.FileExists(strEdgePath) Then
    WshShell.Run """" & strEdgePath & """ --app=http://localhost:3000 --window-size=1366,850", 1, False
ElseIf FSO.FileExists(strChromePath) Then
    WshShell.Run """" & strChromePath & """ --app=http://localhost:3000 --window-size=1366,850", 1, False
Else
    WshShell.Run "http://localhost:3000", 1, False
End If
