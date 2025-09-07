from openai import OpenAI
import streamlit as st
import difflib
import os
import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAPI_KEY"))

# Configure Streamlit page
st.set_page_config(
    page_title="Iron Lady Leadership Chatbot",
    page_icon="👩‍💼",
    layout="centered"
)


# Comprehensive FAQ Dictionary with detailed answers
FAQS = {
    "what programs does iron lady offer": """Iron Lady offers comprehensive leadership programs designed to elevate women to top positions:

🎯 **Executive Leadership Accelerator** - Fast-track your path to C-suite positions with strategic leadership skills
🎯 **Business War Tactics for Women Leaders** - Learn proven corporate strategies and negotiation techniques  
🎯 **Strategic Leadership Mastery** - Advanced program focusing on decision-making and organizational leadership
🎯 **Women in Leadership Excellence Program** - Comprehensive career advancement and personal branding

Each program combines practical business strategies with personalized mentoring to help women break through glass ceilings.

For detailed curriculum and enrollment: https://iamironlady.com/""",

    "what is the program duration": """Iron Lady's programs are designed with flexibility for working professionals:

⏰ **Intensive Programs**: 6-12 weeks for focused skill development and quick wins
⏰ **Comprehensive Programs**: 3-6 months for complete leadership transformation
⏰ **Executive Coaching**: Ongoing support available with flexible scheduling
⏰ **Self-Paced Components**: 24/7 access to resources and recorded sessions

All programs include live interactive sessions, practical assignments, and networking opportunities tailored to your schedule.

View detailed program schedules: https://iamironlady.com/""",

    "is the program online or offline": """Iron Lady offers flexible learning formats to fit your lifestyle:

💻 **Hybrid Learning Model** - Optimal blend of online convenience and in-person networking
💻 **Live Virtual Sessions** - Interactive workshops, masterclasses, and group coaching
💻 **In-Person Events** - Exclusive networking sessions and intensive workshops in Bangalore
💻 **Self-Paced Learning** - Access recorded content, resources, and assignments anytime

This flexible approach ensures you can develop leadership skills regardless of your location or schedule constraints.

Explore all learning options: https://iamironlady.com/""",

    "are certificates provided": """Yes! Iron Lady provides comprehensive certification and recognition:

🏆 **Program Completion Certificates** - Official credentials recognized by top corporations
🏆 **Digital Leadership Badges** - LinkedIn-ready professional badges for your profile
🏆 **Leadership Excellence Certification** - Advanced credentials for senior-level programs
🏆 **Continuing Education Credits** - Professional development units where applicable

All certificates are digitally verifiable and highly valued by employers for leadership positions and career advancement.

Learn more about our certification process: https://iamironlady.com/""",

    "who are the mentors or coaches": """Iron Lady's programs are led by accomplished women leaders and industry veterans:

👩‍💼 **C-Suite Executives** - Current and former CEOs, CTOs, and VPs from Fortune 500 companies
👩‍💼 **Successful Entrepreneurs** - Women who have built and scaled multi-million dollar businesses
👩‍💼 **Leadership Development Experts** - Certified coaches with 15+ years of corporate experience
👩‍💼 **Industry Specialists** - Leaders from technology, finance, consulting, and healthcare sectors

Our mentors provide personalized guidance, real-world insights, and ongoing support to help you achieve your leadership goals and break through career barriers.

Meet our expert mentors: https://iamironlady.com/"""
}

# Sample questions for sidebar
SAMPLE_QUESTIONS = [
    "What programs does Iron Lady offer?",
    "What is the program duration?",
    "Is the program online or offline?",
    "Are certificates provided?",
    "Who are the mentors or coaches?",
    "How can Iron Lady help my career?",
    "What makes your programs different?",
    "How do I enroll in a program?",
    "What is the cost of programs?",
    "Do you offer scholarships?"
]

# Helper: Find closest match in FAQ keys
def get_faq_answer(user_question):
    user_question_lower = user_question.lower().strip()
    matches = difflib.get_close_matches(user_question_lower, FAQS.keys(), n=1, cutoff=0.6)
    if matches:
        return FAQS[matches[0]]
    return None

# OpenAI Fallback with enhanced error handling
def get_ai_answer(user_question):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": """You are a helpful assistant for Iron Lady leadership programs. Only answer based on the following information and https://iamironlady.com:

Iron Lady offers leadership programs for women including Executive Leadership Accelerator, Business War Tactics for Women Leaders, Strategic Leadership Mastery, and Women in Leadership Excellence Program. Programs are 6-12 weeks (intensive) or 3-6 months (comprehensive), offered in hybrid format (online and in-person in Bangalore), with certificates provided, and led by C-suite executives and successful entrepreneurs as mentors.

If the user asks something unrelated to Iron Lady's leadership programs, reply: 'I'm not sure, please check https://iamironlady.com'

Always include the website link https://iamironlady.com in your response."""},
                {"role": "user", "content": user_question}
            ],
            max_tokens=200,
            temperature=0.3
        )
        ai_response = response.choices[0].message.content.strip()
        
        # Ensure website link is included
        if "https://iamironlady.com" not in ai_response:
            ai_response += "\n\nFor more information: https://iamironlady.com"
        
        return ai_response
    except Exception as e:
        return "I'm having trouble connecting right now. Please check https://iamironlady.com for information about Iron Lady's leadership programs."

def main():
    # Header with welcome message
    st.title(" Iron Lady Leadership Chatbot")
    st.markdown("**Elevating a Million Women to the TOP**")
    st.markdown("👋 **Welcome!** Ask me anything about Iron Lady's leadership programs.")
    
    # Sidebar with sample questions
    st.sidebar.title("💡 Try These Questions")
    st.sidebar.markdown("Click any question to auto-fill:")
    
    # Initialize session state for selected question
    if "selected_question" not in st.session_state:
        st.session_state.selected_question = ""
    
    # Sample question buttons
    for i, question in enumerate(SAMPLE_QUESTIONS):
        if st.sidebar.button(f"❓ {question}", key=f"q_{i}"):
            st.session_state.selected_question = question
    
    # Clear chat button
    if st.sidebar.button("🗑️ Clear Chat", type="secondary"):
        st.session_state.messages = []
        st.session_state.selected_question = ""
        st.rerun()
    
    # Initialize chat history
    if "messages" not in st.session_state:
        st.session_state.messages = []
    
    # Display chat history
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
    
    # Chat input with auto-fill from sidebar
    user_question = st.chat_input(
        "Ask me about Iron Lady's leadership programs...",
        key="chat_input"
    )
    
    # Use selected question from sidebar if available
    if st.session_state.selected_question and not user_question:
        user_question = st.session_state.selected_question
        st.session_state.selected_question = ""  # Reset after use
    
    if user_question:
        # Add user message to chat history
        st.session_state.messages.append({"role": "user", "content": user_question})
        
        # Display user message
        with st.chat_message("user"):
            st.markdown(user_question)
        
        # Generate response
        with st.chat_message("assistant"):
            with st.spinner("Thinking..."):
                # First check FAQ
                answer = get_faq_answer(user_question)
                
                # If not FAQ, fallback to AI
                if not answer:
                    answer = get_ai_answer(user_question)
                
                st.markdown(answer)
        
        # Add assistant response to chat history
        st.session_state.messages.append({"role": "assistant", "content": answer})
    
    # Footer
    st.markdown("---")
    st.markdown("🌐 **Official Website:** [https://iamironlady.com/](https://iamironlady.com/)")
    st.markdown("💼 **About:** This chatbot combines predefined FAQs with AI to provide accurate information about Iron Lady's leadership programs.")

if __name__ == "__main__":
    main()
