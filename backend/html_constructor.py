def generate_html(data):
    html_template = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{data["title"]}</title>
        <link rel="stylesheet" href="{data["css"]}">
    </head>
    <body>
        <script src="{data["javascript"]}"/>
    </body>
    </html>
    """
    return html_template