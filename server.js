const express = require('express');
const app = express();
const sass = require('sass');
const path = require('path');
const OpenAI = require('openai');
const fs = require('fs');
require('dotenv').config();

app.use(express.json());
app.use(express.static(__dirname));

app.post('/sendToOpenAI', async (req, res) => {
  const question = req.body.question;
  const openai = new OpenAI();
  const htmlSkeleton = (content) => `
  <!DOCTYPE html>
  <html lang="en" class="govuk-template ">

  <head>
    <meta charset="utf-8">
    <title>GOV.UK - The best place to find government services and information</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#0b0c0c">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <link rel="shortcut icon" sizes="16x16 32x32 48x48" href="/assets/images/favicon.ico" type="image/x-icon">
    <link rel="mask-icon" href="/assets/images/govuk-mask-icon.svg" color="#0b0c0c">
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/govuk-apple-touch-icon-180x180.png">
    <link rel="apple-touch-icon" sizes="167x167" href="/assets/images/govuk-apple-touch-icon-167x167.png">
    <link rel="apple-touch-icon" sizes="152x152" href="/assets/images/govuk-apple-touch-icon-152x152.png">
    <link rel="apple-touch-icon" href="/assets/images/govuk-apple-touch-icon.png">
    <link href="/assets/style.css" rel="stylesheet">
    <script>document.body.className = ((document.body.className) ? document.body.className + ' js-enabled' : 'js-enabled');</script>
  </head>

  <body class="govuk-template__body ">
    <script>
      document.body.className = ((document.body.className) ? document.body.className + ' js-enabled' : 'js-enabled');
    </script>
    <a href="#main-content" class="govuk-skip-link" data-module="govuk-skip-link">Skip to main content</a>
    <header class="govuk-header " role="banner" data-module="govuk-header">
      <div class="govuk-header__container govuk-width-container">
        <div class="govuk-header__logo">
          <a href="/" class="govuk-header__link govuk-header__link--homepage">
            <span class="govuk-header__logotype">
              <span class="govuk-header__logotype-text">
                GOV.UK (AI-generated prototype)
              </span>
            </span>
          </a>
        </div>
      </div>
    </header>
    <div class="govuk-width-container ">
      ${content}
    </div>
    <footer class="govuk-footer " role="contentinfo">
      <div class="govuk-width-container ">
        <div class="govuk-footer__meta">
          <div class="govuk-footer__meta-item govuk-footer__meta-item--grow">
            <svg
              aria-hidden="true"
              focusable="false"
              class="govuk-footer__licence-logo"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 483.2 195.7"
              height="17"
              width="41">
              <path
                fill="currentColor"
                d="M421.5 142.8V.1l-50.7 32.3v161.1h112.4v-50.7zm-122.3-9.6A47.12 47.12 0 0 1 221 97.8c0-26 21.1-47.1 47.1-47.1 16.7 0 31.4 8.7 39.7 21.8l42.7-27.2A97.63 97.63 0 0 0 268.1 0c-36.5 0-68.3 20.1-85.1 49.7A98 98 0 0 0 97.8 0C43.9 0 0 43.9 0 97.8s43.9 97.8 97.8 97.8c36.5 0 68.3-20.1 85.1-49.7a97.76 97.76 0 0 0 149.6 25.4l19.4 22.2h3v-87.8h-80l24.3 27.5zM97.8 145c-26 0-47.1-21.1-47.1-47.1s21.1-47.1 47.1-47.1 47.2 21 47.2 47S123.8 145 97.8 145" />
            </svg>
            <span class="govuk-footer__licence-description">
              All content is available under the
              <a
                class="govuk-footer__link"
                href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
                rel="license">Open Government Licence v3.0</a>, except where otherwise stated
            </span>
          </div>
          <div class="govuk-footer__meta-item">
            <a
              class="govuk-footer__link govuk-footer__copyright-logo"
              href="https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/">© Crown copyright</a>
          </div>
        </div>
      </div>
    </footer>
    <script src="/assets/all.js"></script>
    <script>
      window.GOVUKFrontend.initAll()
    </script>
  </body>
  </html>
  `;
  try {
  	const completion = await openai.chat.completions.create({
  		messages: [
		{
			role: "system", 
			content: "You are a code generator. You only respond with HTML code that uses  components and patterns from the GOV.UK Design System, and nothing else. You need to pick the right components, for example accordions or lists. You also need to use the right patterns and recognise when something should be formatted as a start page or a question page or a task. Only include main content that's inside <main>. IGNORE metadata (<meta>), header (<header>) and footer (<footer>). Make sure to apply relevant classes to links and paragraphs. Make sure to use the grid system, even if it's just a one-colum layout. Don't include anything that isn't code. Only respond with code as plain text without code block syntax around it."
		},
		{
			role: "user",
			content: question
		}],
		max_tokens: 2794,
		model: "gpt-3.5-turbo-1106"
  	});

    const htmlContent = completion.choices[0].message.content;
    const filename = `${Date.now()}.html`;

    fs.writeFile('pages/' + filename, htmlSkeleton(htmlContent), (err) => {
      if (err) {
        console.error('Error writing file:', err);
      }
    });

    const responseObj = {
      filename: filename,
      completion: completion // or any other data you want to include
    };

    res.json(responseObj);


  } catch(error) {
  	console.error('Error in OpenAI API call:', error);
      return res.status(500).send('Error processing the request');
  }

});

const port = 3000;
app.listen(port, () => {
	console.log('Server running at http://localhost:3000');
})