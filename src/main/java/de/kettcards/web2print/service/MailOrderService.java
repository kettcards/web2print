package de.kettcards.web2print.service;

import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;

@Service
@Configuration
public class MailOrderService {
    /*
    @Autowired
    private JavaMailSender mailSender;

    @PostConstruct()
    public void init() throws MessagingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper message = new MimeMessageHelper(mimeMessage, true);
        message.setFrom("abc");
        message.setTo("topsecrethoch3@gmail.com");
        message.setSubject("hello there");
        message.setText("hellow there owo");
        message.addAttachment("file.txt",new PathResource(Paths.get("build.gradle")));
        mailSender.send(mimeMessage);
    }
        */

}
