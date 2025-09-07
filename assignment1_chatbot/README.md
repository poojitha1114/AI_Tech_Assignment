# Iron Lady Leadership Chatbot

A professional Streamlit chatbot for Iron Lady's leadership programs, combining predefined FAQs with AI for maximum accuracy. Ready for assignment submission and demo.

## Features

- **Hybrid Intelligence**: Combines predefined FAQ answers with AI for accurate, non-repetitive responses
- **Professional Interface**: Clean chat experience with conversation history and clickable sample questions
- **Production Ready**: Works immediately without requiring users to configure API keys
- **Accurate Responses**: Uses exact FAQ matching first, then AI fallback for other Iron Lady questions
- **Always Helpful**: Every response includes the official website link https://iamironlady.com/
- **Error Handling**: Graceful handling of API issues with friendly fallback messages
- **Interactive Sidebar**: 10 sample questions users can click to auto-fill the input

## Quick Start

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the application**:
   ```bash
   streamlit run create.py
   ```

3. **Open your browser** and go to the displayed URL (usually `http://localhost:8501`)

That's it! The chatbot is ready to use with no additional setup required.

## How It Works

### Intelligent Response System
1. **FAQ Matching**: First checks if your question matches predefined FAQs using fuzzy string matching
2. **AI Fallback**: For other Iron Lady questions, uses OpenAI GPT-4o-mini with strict guidelines
3. **Smart Filtering**: Non-Iron Lady questions receive polite redirects to the official website

### User Experience
- **Interactive Sidebar**: Click any of the 10 sample questions to auto-fill the input
- **Chat History**: Full conversation history maintained during your session
- **Clear Chat**: Reset conversation anytime with the sidebar button
- **Professional Design**: Clean interface with emojis, formatting, and clear structure

## Sample Questions for Testing

The chatbot includes these sample questions in the sidebar:
1. What programs does Iron Lady offer?
2. What is the program duration?
3. Is the program online or offline?
4. Are certificates provided?
5. Who are the mentors or coaches?
6. How can Iron Lady help my career?
7. What makes your programs different?
8. How do I enroll in a program?
9. What is the cost of programs?
10. Do you offer scholarships?

## Technical Details

- **Framework**: Streamlit for web interface
- **AI Model**: OpenAI GPT-4o-mini for intelligent responses
- **FAQ Matching**: Python difflib for fuzzy string matching
- **Error Handling**: Graceful fallbacks for API issues
- **No Setup Required**: API key embedded for production use

## How It Works

### Intelligent Question Processing
- **Iron Lady Questions**: AI provides detailed, contextual responses using Iron Lady's knowledge base
- **General Questions**: Bot politely redirects to the official website
- **Keyword Detection**: Smart algorithm determines question relevance

### Response Types
- **AI-Powered**: Dynamic responses for Iron Lady-related questions (with API key)
- **Fallback**: Helpful redirects for non-related questions
- **Error Handling**: Graceful degradation when API is unavailable

## Project Structure

```
assignment 1/
├── chatbot.py          # Main Streamlit AI application
├── requirements.txt    # Python dependencies
└── README.md          # This documentation
```

## Sample Questions to Try

### Iron Lady Related (AI will provide detailed responses):
- "What leadership programs do you offer?"
- "How can Iron Lady help advance my career?"
- "Tell me about your mentors and their backgrounds"
- "What makes Iron Lady different from other leadership programs?"
- "How long are the programs and what's the format?"
- "Do you provide certificates upon completion?"

### Non-Iron Lady Questions (Will redirect to website):
- "What's the weather like?"
- "How do I cook pasta?"
- "Tell me about machine learning"

## Technical Details

- **Framework**: Streamlit for the web interface
- **AI Model**: OpenAI GPT-3.5-turbo
- **Language**: Python 3.7+
- **Intelligence**: Context-aware question classification
- **Fallback**: Graceful handling of API failures

## Iron Lady Knowledge Base

The AI has comprehensive knowledge about:
- **Programs**: Executive Leadership Accelerator, Business War Tactics, Strategic Leadership Mastery
- **Duration**: 6-12 weeks (intensive) to 3-6 months (comprehensive)
- **Format**: Hybrid model with online/offline sessions
- **Certificates**: Program completion certificates and digital badges
- **Mentors**: C-Suite executives and leadership experts with 15+ years experience
- **Mission**: Elevating a million women to top positions
- **Location**: Based in Indiranagar, Bengaluru, Karnataka

## Production Ready Features

- **Error Handling**: Robust exception handling for API failures
- **Environment Variables**: Secure API key management
- **User Experience**: Professional interface with clear status indicators
- **Scalability**: Efficient AI integration with proper rate limiting
- **Documentation**: Comprehensive setup and usage instructions

## About Iron Lady

Iron Lady is a leading leadership platform dedicated to elevating women to top positions. Based in Bangalore, India, they offer comprehensive leadership programs using business war tactics to fast-track career growth for women professionals.

**Official Website**: [https://iamironlady.com/](https://iamironlady.com/)

---

**Note**: This AI chatbot is created for educational purposes. For official information and enrollment, please visit Iron Lady's website.
