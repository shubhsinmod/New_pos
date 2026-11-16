Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice("Microsoft Zira Desktop")
$synth.Rate = 0
$synth.SetOutputToWaveFile("voiceover_workflow.wav")

$text = "Welcome to Tableflow Multi-Outlet POS. Here is the complete end-to-end restaurant workflow. " +
        "First, in the POS Terminal, browse our live menu with rich categories, prices, and dietary tags. " +
        "We select Table T-02 and add Butter Chicken, Paneer Butter Masala, and Garlic Naan to the cart. " +
        "Next, we fire the order to the kitchen with one click. The items are instantly locked and dispatched as Kitchen Order Tickets. " +
        "Now, the kitchen team takes over on the live KDS Kanban board. The chef reviews the ticket, starts preparation, and marks food ready to serve when cooked. " +
        "Finally, back at the counter, we settle the bill. We select cash payment, tender 1000 rupees, calculate return change, and generate the instant tax invoice. " +
        "Complete, seamless restaurant operations, built with Spring Boot, Microsoft SQL Server, and React."

$synth.Speak($text)
$synth.Dispose()
Write-Host "Workflow voiceover generated!"
