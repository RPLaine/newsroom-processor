def generate_html(data):
    html_template = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{data["title"]}</title>
        <link rel="stylesheet" href="{data["css"]}">
        <link rel="icon" href="{data['favicon']}" type="image/svg+xml">
    </head>
    <body>
        <script type="module" src="{data["javascript"]}"></script>
    </body>
    </html>
    """
    return html_template