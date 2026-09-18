# Equal World Shipping — Live Chat Integration

The public website's floating **Live Chat** button is connected to **Admin Dashboard → Messages**.

### Customer
- Opens Live Chat.
- Starts a conversation with name and email.
- Sends messages through the existing secure visitor-token flow.
- Receives admin replies automatically while the chat is open (3-second refresh).

### Admin
- Opens **Messages** in the admin dashboard.
- Sees customer conversations in one shared inbox.
- Each customer has a separate conversation.
- Replies from the dashboard.
- Inbox refreshes automatically every 4 seconds and refreshes the selected conversation when it changes.

### Backend
This ZIP uses the existing `equal-world-api-v2` endpoints:
`chat_start`, `chat_message`, `chat_messages`, `chat_sessions`, `admin_chat_messages`, and `admin_chat_reply`.

The frontend contains no Supabase service-role key. Keep authorization, visitor-token validation, admin authorization, database RLS, and CORS restrictions enforced by the backend.

No separate chat provider is required.
