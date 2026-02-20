export async function triggerWebhook(payload: any) {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn("N8N_WEBHOOK_URL is not set");
        return;
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error(`Webhook failed with status: ${response.status}`);
        }
    } catch (error) {
        console.error("Webhook Error:", error);
        // Don't throw, just log. We don't want to fail the user request if webhook fails (or maybe we do? prompt says "Once steps are complete send POST")
    }
}
