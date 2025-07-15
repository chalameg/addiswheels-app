# AddisWheels Chatbot Setup Guide

## Overview
The AddisWheels application now includes a Gemini AI-powered chatbot that helps users with booking, vehicle availability, payment, and subscription questions.

## Environment Variables

Add the following variables to your `.env.local` file:

```env
# Chatbot Configuration
ENABLE_CHATBOT=true
GEMINI_API_KEY="your-gemini-api-key-here"

# Public environment variables (accessible in client-side code)
NEXT_PUBLIC_ENABLE_CHATBOT=true
```

## Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Add it to your `.env.local` file as `GEMINI_API_KEY`

## Features

### Chatbot Capabilities
- **Booking Assistance**: Help users understand the booking process
- **Vehicle Information**: Provide details about available vehicles
- **Payment Support**: Answer questions about payment methods and pricing
- **Subscription Help**: Explain subscription plans and benefits
- **General Support**: Handle general inquiries about AddisWheels

### UI Features
- **Floating Chat Button**: Fixed position in bottom-right corner
- **Expandable Chat Window**: Click to open/close the chat interface
- **Message History**: Maintains conversation context (limited to 5 messages for performance)
- **Loading States**: Visual feedback during API calls
- **Error Handling**: Graceful error messages for failed requests
- **Responsive Design**: Works on desktop and mobile devices

### Security Features
- **Server-side API Calls**: All Gemini API calls are made server-side
- **Environment-based Toggle**: Can be completely disabled via environment variables
- **Input Validation**: Proper validation of user inputs
- **Rate Limiting**: Built-in message limits for performance

## Usage

### For Users
1. Look for the chat icon in the bottom-right corner of any page
2. Click the icon to open the chat window
3. Type your question and press Enter or click Send
4. The AI assistant will respond with helpful information
5. Use the trash icon to clear the conversation history

### For Developers
The chatbot is automatically included on all pages via the `ClientNavWrapper` component. To disable it:

1. Set `ENABLE_CHATBOT=false` in your environment variables
2. Set `NEXT_PUBLIC_ENABLE_CHATBOT=false` for client-side checks

## File Structure

```
src/
├── lib/
│   └── gemini.ts              # Gemini API integration
├── components/
│   └── Chatbot.tsx            # React chatbot component
└── app/
    └── api/
        └── chatbot/
            └── route.ts       # API route for chatbot requests
```

## Customization

### Styling
The chatbot uses Tailwind CSS classes and can be customized by modifying the `Chatbot.tsx` component.

### System Prompt
The system prompt can be modified in `src/lib/gemini.ts` in the `prepareMessagesWithSystemPrompt` function.

### Message Limits
The message history limit (currently 5) can be adjusted in both the API route and the component.

## Troubleshooting

### Chatbot Not Appearing
- Check that `NEXT_PUBLIC_ENABLE_CHATBOT=true` is set
- Ensure the environment variable is properly loaded
- Check browser console for any errors

### API Errors
- Verify your `GEMINI_API_KEY` is correct
- Check that `ENABLE_CHATBOT=true` is set
- Review server logs for detailed error messages
- Ensure you have sufficient Gemini API quota

### Performance Issues
- The chatbot limits conversation history to 5 messages
- Consider reducing the `maxOutputTokens` in the API call if responses are too long
- Monitor API usage to stay within rate limits

## Support

For issues with the chatbot feature, please check:
1. Environment variable configuration
2. Gemini API key validity
3. Network connectivity
4. Browser console for client-side errors
5. Server logs for API errors 