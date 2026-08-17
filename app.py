"""
app.py — Finova entry point.

Handles the landing page, authentication (login/register), and a custom
sidebar-driven navigation system for all authenticated pages. Using a
single-entry custom router (instead of Streamlit's native multipage
folder convention) gives full control over the sidebar's look and feel,
which the product spec calls for.
"""

import streamlit as st

from utils.authentication import (
    is_authenticated, login_user, register_user, start_session, logout, current_user_id,
)
from utils.ui import load_css, disclaimer_strip
from database.connection import is_db_connected

from pages import (
    _dashboard as dashboard,
    _finance as finance,
    _transactions as transactions,
    _goals as goals,
    _risk as risk,
    _ai_planner as ai_planner,
    _simulator as simulator,
    _what_if as what_if,
    _analytics as analytics,
    _profile as profile,
    _settings as settings,
)

st.set_page_config(page_title="Finova — Track. Plan. Invest. Grow.", page_icon="💠", layout="wide")
load_css("assets/styles.css")

NAV_ITEMS = [
    ("📊  Dashboard", "dashboard", dashboard),
    ("💳  Personal Finance", "finance", finance),
    ("🧾  Transactions", "transactions", transactions),
    ("🎯  Financial Goals", "goals", goals),
    ("🧭  Risk Assessment", "risk", risk),
    ("🤖  AI Investment Planner", "ai_planner", ai_planner),
    ("📈  Investment Simulator", "simulator", simulator),
    ("🔀  What-If Analysis", "what_if", what_if),
    ("📉  Analytics", "analytics", analytics),
    ("👤  Profile", "profile", profile),
    ("⚙️  Settings", "settings", settings),
]


def render_sidebar():
    with st.sidebar:
        st.markdown(
            "<div style='display:flex;align-items:center;gap:8px;font-size:1.35rem;font-weight:800;'>"
            "💠 FINOVA</div>",
            unsafe_allow_html=True,
        )
        st.caption("Track. Plan. Invest. Grow.")
        st.write("")

        status = "🟢 Connected" if is_db_connected() else "🔴 Database offline"
        st.caption(status)

        st.write("")
        current = st.session_state.get("active_page", "dashboard")
        for label, key, _module in NAV_ITEMS:
            btn_type = "primary" if current == key else "secondary"
            if st.button(label, key=f"nav_{key}", use_container_width=True, type=btn_type):
                st.session_state["active_page"] = key
                st.rerun()

        st.write("")
        st.divider()
        st.markdown(
            f"<div style='display:flex;align-items:center;gap:10px;'>"
            f"<div style='width:34px;height:34px;border-radius:50%;background:#EEF0FF;"
            f"display:flex;align-items:center;justify-content:center;font-weight:700;color:#4F46E5;'>"
            f"{(st.session_state.get('user_name') or 'U')[:1].upper()}</div>"
            f"<div><div style='font-weight:600;font-size:0.88rem;'>{st.session_state.get('user_name', '')}</div>"
            f"<div style='font-size:0.72rem;color:#8A8FA3;'>Logged in</div></div></div>",
            unsafe_allow_html=True,
        )
        st.write("")
        if st.button("Logout", use_container_width=True):
            logout()
            st.session_state["active_page"] = "dashboard"
            st.rerun()


def render_landing():
    st.markdown(
        """
        <div class="finova-hero">
            <h1>💠 Finova</h1>
            <p class="tagline">Track. Plan. Invest. Grow.</p>
            <p class="subtext">
                Finova is an AI-powered personal finance and investment planning platform.
                Track your spending, set financial goals, understand your risk tolerance,
                and get educational, AI-assisted investment guidance — all in one place.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    c1, c2, c3 = st.columns([1, 1, 1])
    with c2:
        b1, b2 = st.columns(2)
        with b1:
            if st.button("Get Started", type="primary", use_container_width=True):
                st.session_state["auth_tab"] = "Register"
                st.session_state["show_auth"] = True
                st.rerun()
        with b2:
            if st.button("Login", use_container_width=True):
                st.session_state["auth_tab"] = "Login"
                st.session_state["show_auth"] = True
                st.rerun()

    st.write("")
    st.write("")

    features = [
        ("💳", "Personal Finance", "Track income and expenses with clear, categorized insights."),
        ("🎯", "Smart Goals", "Set goals and see exactly what monthly contribution gets you there."),
        ("🧭", "Risk Assessment", "Understand your comfort with investment risk through a guided questionnaire."),
        ("🤖", "AI Investment Planning", "Get educational, explainable investment-category suggestions."),
        ("📈", "Future Projection", "Simulate how your investments could grow over time."),
        ("🔀", "What-If Analysis", "Compare different saving and investing strategies side by side."),
    ]

    cols = st.columns(3)
    for i, (icon, title, desc) in enumerate(features):
        with cols[i % 3]:
            st.markdown(
                f"""<div class="feature-card"><h4>{icon} {title}</h4><p>{desc}</p></div>""",
                unsafe_allow_html=True,
            )
            st.write("")

    st.write("")
    disclaimer_strip()

    if st.session_state.get("show_auth"):
        render_auth_panel()


def render_auth_panel():
    st.divider()
    tabs = st.tabs(["Login", "Register"])
    default_tab_login = st.session_state.get("auth_tab", "Login") == "Login"

    with tabs[0]:
        with st.form("login_form"):
            email = st.text_input("Email", key="login_email")
            password = st.text_input("Password", type="password", key="login_password")
            submitted = st.form_submit_button("Log In", type="primary")
            if submitted:
                ok, msg, user = login_user(email, password)
                if ok:
                    start_session(user)
                    st.session_state["active_page"] = "dashboard"
                    st.session_state["show_auth"] = False
                    st.success(msg)
                    st.rerun()
                else:
                    st.error(msg)

    with tabs[1]:
        with st.form("register_form"):
            full_name = st.text_input("Full name")
            email = st.text_input("Email", key="reg_email")
            c1, c2 = st.columns(2)
            with c1:
                password = st.text_input("Password", type="password", key="reg_password")
                age = st.number_input("Age", min_value=16, max_value=100, value=22)
            with c2:
                occupation = st.text_input("Occupation", placeholder="e.g. Student, Analyst")
                monthly_income = st.number_input("Monthly income (₹)", min_value=0.0, step=1000.0)
            submitted = st.form_submit_button("Create Account", type="primary")
            if submitted:
                ok, msg = register_user(full_name, email, password, age, occupation, monthly_income)
                if ok:
                    st.success(msg)
                else:
                    st.error(msg)


def main():
    if not is_authenticated():
        render_landing()
        return

    render_sidebar()
    active_key = st.session_state.get("active_page", "dashboard")
    page_module = next((m for _l, k, m in NAV_ITEMS if k == active_key), dashboard)
    page_module.render()


if __name__ == "__main__":
    main()
