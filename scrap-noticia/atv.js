const nodemailer = require('nodemailer');
const axios = require('axios');
const cheerio = require('cheerio'); // Adicione o Cheerio para o scraping
require('dotenv').config(); // Para carregar variáveis de ambiente do arquivo .env

async function sendEmail(news) {
    const newsList = news.map(item => {
        return `<li>
            <strong>${item.title}</strong><br>
            <a href="${item.link}">Leia mais</a><br>
            <img src="${item.imageUrl}" alt="${item.title}" style="max-width:100%; height:auto; display:block; margin: 10px 0;"><br>
            <small>${item.time} - ${item.section}</small>
        </li>`;
    }).join('');

    const htmlContent = `
        <h1>Últimas Notícias</h1>
        <ul style="list-style-type: none; padding: 0; margin: 0;">
            ${newsList}
        </ul>
        <style>
            /* Responsividade */
            @media (max-width: 600px) {
                h1 {
                    font-size: 1.5em;
                }
                ul {
                    padding-left: 20px;
                }
                li {
                    margin-bottom: 15px;
                }
            }
        </style>
    `;

    // Criando o transporte do Nodemailer com variáveis de ambiente
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    // Configuração do e-mail
    const mailOptions = {
        from: process.env.EMAIL,
        to: 'alexandrexandinho770@gmail.com',
        subject: 'Últimas Notícias do Sport',
        html: htmlContent, 
    };

    // Enviando o e-mail
    try {
        console.log('Enviando o e-mail...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Email enviado com sucesso:', info.response);
    } catch (error) {
        console.error('Erro ao enviar o e-mail:', error);
    }
}

async function scrapAndSendEmail() {
    try {
        console.log('Iniciando o processo de scraping e envio de e-mail...');

        // Fazendo scraping do site
        const response = await axios.get('https://ge.globo.com/pe/futebol/times/sport/');
        const $ = cheerio.load(response.data);

        const news = [];

        // Coletando as notícias
        $('.bastian-feed-item').each((index, element) => {
            const title = $(element).find('h2 a p').text();
            const link = $(element).find('h2 a').attr('href');
            const imageUrl = $(element).find('img').attr('src');
            const time = $(element).find('.feed-post-datetime').text();
            const section = $(element).find('.feed-post-metadata-section').text().trim();

            news.push({ title, link, imageUrl, time, section });
        });

        console.log('Notícias coletadas:', news);

        // Se as notícias foram coletadas, envia o e-mail
        if (news.length > 0) {
            await sendEmail(news);
        } else {
            console.log('Nenhuma notícia encontrada para enviar.');
        }
    } catch (error) {
        console.error('Erro ao fazer o scraping:', error);
    }
}

// Chamando a função principal para executar o processo de scraping e envio de e-mail
scrapAndSendEmail();
