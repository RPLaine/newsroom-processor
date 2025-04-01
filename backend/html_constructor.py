import html

def generate_html(data: dict) -> str:
    title = html.escape(data.get("title", "Default Title"))
    css = html.escape(data.get("css", "styles.css"))
    favicon = html.escape(data.get("favicon", "favicon.svg"))
    javascript = html.escape(data.get("javascript", "script.js"))

    html_template = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
        <link rel="stylesheet" href="{css}">
        <link rel="icon" href="{favicon}" type="image/svg+xml">
    </head>
    <body>
        <script type="module" src="{javascript}"></script>
    </body>
    </html>
    """
    return html_template