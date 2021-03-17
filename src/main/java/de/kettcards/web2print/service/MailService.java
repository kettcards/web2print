package de.kettcards.web2print.service;

import de.kettcards.web2print.config.ApplicationConfiguration;
import de.kettcards.web2print.config.MailConfiguration;
import de.kettcards.web2print.model.OrderFormData;
import de.kettcards.web2print.storage.Content;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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

    private final String fromMail = "noreply@kettcards.de";
    private final String personalMail = "Kettcards Automailer";

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
    }

    public void sendInternalMail(OrderFormData data, Resource pdf, String fileName) throws MessagingException, IOException {
        var text = substituteTokens(internalTemplate, data)
            .replace("${filename}", fileName);

        var mail = prepareMail(config.getMail().getRecipient(), "Neue Anfrage", text, pdf, fileName);

        mailer.send(mail);
    }
    public void sendUserMail(OrderFormData data) throws MessagingException, IOException {
        var text = substituteTokens(userTemplate, data);

        var mail = prepareMail(data.getEmail(), "Bestätigung der Anfrage", text, null, null);

        mailer.send(mail);
    }

    private MimeMessage prepareMail(String to, String subject, String text, Resource content, String contentName)
            throws MessagingException, IOException {
        var mimeMail = mailer.createMimeMessage();
        var mail = new MimeMessageHelper(mimeMail, true);
        mail.setFrom(fromMail, personalMail);
        mail.setTo(to);
        mail.setSubject(subject);
        mail.setText(text, true);

        if (content != null) {
            var filename = contentName;
            if (content.getFilename() != null)
                filename = content.getFilename();
            mail.addAttachment(filename, content);
        }

        return mimeMail;
    }

    private String substituteTokens(String template, OrderFormData data) {
        var ret = template;
        try {
            for (var field : OrderFormData.class.getDeclaredFields()) {
                field.setAccessible(true);

                ret = ret.replace("${" + field.getName() + "}", Objects.toString(field.get(data), ""));
            }
        } catch (Exception ex) {
            log.error("unable to substitute form: " + template);
        }

        return ret;
    }
}
