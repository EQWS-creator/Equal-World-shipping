# AI support integration note

The homepage chat is permanently integrated and uses the existing secure visitor-chat API.

For true AI-generated replies, the Supabase Edge Function must be extended with a server-side AI provider/API key. The browser must never receive that secret.

Recommended flow:
1. Visitor sends message with signed visitor token.
2. Edge Function stores the message.
3. If the conversation is in AI mode, the server sends a constrained support prompt to the AI provider.
4. The AI may answer general service questions and retrieve only safe shipment data by tracking code.
5. If the customer asks for a human or the AI cannot answer safely, mark/escalate the session for admin takeover.
6. Admin replies set the session to human mode; returning to AI can be an explicit admin action.

Do not place AI API keys in GitHub Pages files.
