package de.kettcards.web2print.service;

import de.kettcards.web2print.config.ApplicationConfiguration;
import de.kettcards.web2print.config.MailConfiguration;
import de.kettcards.web2print.model.OrderFormData;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import javax.mail.Address;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.internet.*;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.Objects;

@Slf4j
@Service
public class MailService {
    @Autowired
    private JavaMailSender mailer;
    private final Address  senderAddr = new InternetAddress("noreply@kettcards.de", "Kettcards Automailer");
    private final InternetAddress internalReceiverAddr;

    private final String internalTemplate;
    private final String     userTemplate;

    private final ApplicationConfiguration config;


    @SneakyThrows(UnsupportedEncodingException.class)
    public MailService(ApplicationConfiguration config) throws IOException, AddressException {
        this.config = config;
        // (lucas 14.03.21) todo: load from external folder
        try (var s = getClass().getClassLoader().getResourceAsStream("InternalTemplate.html")) {
            internalTemplate = IOUtils.toString(s, String.valueOf(StandardCharsets.UTF_8));
        }
        try (var s = getClass().getClassLoader().getResourceAsStream("UserTemplate.html")) {
            userTemplate = IOUtils.toString(s, String.valueOf(StandardCharsets.UTF_8));
        }
        internalReceiverAddr = new InternetAddress(config.getMail().getRecipient());
    }

    public void sendInternalMail(OrderFormData data, Resource pdf, String fileName) throws MessagingException {
        var content = substituteTokens(internalTemplate, data)
            .replace("${filename}", fileName);

        var mail = prepareMail(internalReceiverAddr, "Neue Anfrage", content);

        // (lucas 14.03.21) todo: find out why this does not work
        //var helper = new MimeMessageHelper(mail, true);
        //helper.addAttachment(fileName, pdf, "application/pdf");

        mailer.send(mail);
    }
    public void sendUserMail(OrderFormData data) throws MessagingException {
        var content = substituteTokens(userTemplate, data);

        var mail = prepareMail(new InternetAddress(data.getEmail()), "Bestätigung der Anfrage", content);

        mailer.send(mail);
    }

    private MimeMessage prepareMail(Address to, String subject, String content) throws MessagingException {
        var mail = mailer.createMimeMessage();
        mail.setFrom(senderAddr);
        mail.setRecipient(Message.RecipientType.TO, to);
        mail.setSubject(subject);
        mail.setContent(content, "text/html; charset=UTF-8");

        return mail;
    }

    @SneakyThrows(IllegalAccessException.class)
    private String substituteTokens(String template, OrderFormData data) {
        var ret = template;
        for(var field : OrderFormData.class.getDeclaredFields()) {
            field.setAccessible(true);

            ret = ret.replace("${"+field.getName()+"}", Objects.toString(field.get(data), ""));
        }

        return ret;
    }
}
