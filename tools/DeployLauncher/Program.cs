using System.Diagnostics;

var baseDirectory = AppContext.BaseDirectory;
var scriptPath = Path.Combine(baseDirectory, "deploy-to-github.ps1");

if (!File.Exists(scriptPath))
{
    Console.ForegroundColor = ConsoleColor.Red;
    Console.WriteLine("Nu gasesc deploy-to-github.ps1 langa executabil.");
    Console.ResetColor();
    Console.WriteLine("Apasa Enter pentru inchidere.");
    Console.ReadLine();
    return 1;
}

var escapedArgs = args.Select(argument => "\"" + argument.Replace("\"", "\\\"") + "\"");
var powershellArgs = $"-NoProfile -ExecutionPolicy Bypass -File \"{scriptPath}\" {string.Join(" ", escapedArgs)}";

var startInfo = new ProcessStartInfo
{
    FileName = "powershell.exe",
    Arguments = powershellArgs,
    WorkingDirectory = baseDirectory,
    UseShellExecute = false
};

using var process = Process.Start(startInfo);

if (process is null)
{
    Console.ForegroundColor = ConsoleColor.Red;
    Console.WriteLine("Nu am putut porni PowerShell.");
    Console.ResetColor();
    Console.WriteLine("Apasa Enter pentru inchidere.");
    Console.ReadLine();
    return 1;
}

process.WaitForExit();

Console.WriteLine();
Console.WriteLine(process.ExitCode == 0 ? "Deploy terminat cu succes." : "Deploy oprit cu eroare. Verifica deploy-last.log.");
Console.WriteLine("Apasa Enter pentru inchidere.");
Console.ReadLine();

return process.ExitCode;
