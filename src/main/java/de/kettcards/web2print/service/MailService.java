package de.kettcards.web2print.service;

import de.kettcards.web2print.model.OrderFormData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Slf4j
@Service
public class MailService {
  private final String internalTemplate;
  private final String     userTemplate;

  public MailService() {


  }

  public void sendInternalMail(OrderFormData data) {
    String content = "<h3>test</h3>" +
        "some more tests" +
        "alright: " + data.getEmail();

    sendMail(InternetAddress.parse(data.getEmail()), "Neue Anfrage", content);
  }

  private void sendMail(Address[] to, String subject, String content) throws MessagingException {
    var message = new MimeMessage(session);
    message.setFrom(senderAddr);
    message.setRecipients(Message.RecipientType.TO, to);
    message.setSubject(subject);
    message.setContent(content, "text/html; charset=UTF-8");

    Transport.send(message);
  }
}
