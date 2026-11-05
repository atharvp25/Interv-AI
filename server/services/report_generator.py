import io
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.colors import HexColor


def generate_evaluation_pdf(ev: dict) -> io.BytesIO:
    """Generate a PDF report for a given evaluation document and return a BytesIO buffer."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    title_style.textColor = HexColor("#2563eb")
    h2_style = styles['Heading2']
    h2_style.textColor = HexColor("#1e293b")
    normal_style = styles['Normal']
    normal_style.fontSize = 11
    normal_style.leading = 14

    story = []

    # Title & Header
    story.append(Paragraph("IntervAI - Interview Report", title_style))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"<b>Candidate:</b> {ev.get('username')}", normal_style))
    
    # Format date nice
    dt = datetime.datetime.fromisoformat(ev.get("timestamp").replace("Z", "+00:00"))
    date_str = dt.strftime("%B %d, %Y at %I:%M %p")
    story.append(Paragraph(f"<b>Date:</b> {date_str}", normal_style))
    story.append(Spacer(1, 24))

    # Scores
    story.append(Paragraph("Scores", h2_style))
    scores = ev.get("scores", {})
    score_items = [
        ListItem(Paragraph(f"<b>Overall Score:</b> {scores.get('overall_score', 0)}/10", normal_style)),
        ListItem(Paragraph(f"<b>Technical Accuracy:</b> {scores.get('technical_accuracy', 0)}/10", normal_style)),
        ListItem(Paragraph(f"<b>Communication:</b> {scores.get('communication', 0)}/10", normal_style)),
        ListItem(Paragraph(f"<b>Confidence:</b> {scores.get('confidence', 0)}/10", normal_style)),
        ListItem(Paragraph(f"<b>Depth of Answer:</b> {scores.get('depth', 0)}/10", normal_style)),
        ListItem(Paragraph(f"<b>Completeness:</b> {scores.get('completeness', 0)}/10", normal_style)),
    ]
    story.append(ListFlowable(score_items, bulletType='bullet'))
    story.append(Spacer(1, 24))

    # Feedback
    feedback = ev.get("feedback", {})
    if not feedback and ev.get("review"):
        # Fallback for old evaluations
        story.append(Paragraph("Review", h2_style))
        story.append(Paragraph(ev.get("review"), normal_style))
    else:
        # Strengths
        story.append(Paragraph("Strengths", h2_style))
        strengths = feedback.get("strengths", [])
        if strengths:
            story.append(ListFlowable([ListItem(Paragraph(s, normal_style)) for s in strengths], bulletType='bullet'))
        else:
            story.append(Paragraph("None identified.", normal_style))
        story.append(Spacer(1, 12))

        # Areas for Improvement
        story.append(Paragraph("Areas for Improvement", h2_style))
        areas = feedback.get("areas_for_improvement", [])
        if areas:
            story.append(ListFlowable([ListItem(Paragraph(a, normal_style)) for a in areas], bulletType='bullet'))
        else:
            story.append(Paragraph("None identified.", normal_style))
        story.append(Spacer(1, 12))

        # Summary
        story.append(Paragraph("Summary", h2_style))
        story.append(Paragraph(feedback.get("summary", "No summary provided."), normal_style))

    doc.build(story)
    buffer.seek(0)
    return buffer

