package de.kettcards.web2print.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.kettcards.web2print.model.OrderFormData;
import de.kettcards.web2print.pdf.CardData;
import de.kettcards.web2print.pdf.PDFGenerator;
import de.kettcards.web2print.storage.Content;
import de.kettcards.web2print.storage.StorageContextAware;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.function.Supplier;

@Slf4j
@Service
public final class PDFExportService extends StorageContextAware {
  @Override
  public String getNamespace() {
    return "ordered";
  }

  private final DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");
  @Override
  public Supplier<String> getNameGenerator() {
    return () -> LocalDateTime.now().format(dateFormat);
  }

  @Autowired private ObjectMapper jsonMapper;
  @Autowired private PDFGenerator generator;
  @Autowired private MailService  mailService;

  /**
   * @param rawData base64 encoded json card data string
   * @throws IOException    if pdf creation was unsuccessful
   */
  public void exportPDF(String rawData, String rawAdditionalData) throws IOException, MessagingException {
    var cardData       = jsonMapper.readValue(decode(rawData)          ,      CardData.class);
    var additionalData = jsonMapper.readValue(decode(rawAdditionalData), OrderFormData.class);

    byte[] inMemPdf;
    String fileName;
    try (PDDocument generate = generator.generate(cardData)) {
      var stream = new ByteArrayOutputStream();
      generate.save(stream);
      inMemPdf = stream.toByteArray();
      fileName = save(new Content(new ByteArrayResource(inMemPdf), "application/pdf", "generated.pdf"));
    }

    mailService.sendInternalMail(additionalData, new ByteArrayResource(inMemPdf), fileName);
    mailService.sendUserMail(additionalData);
  }

  private byte[] decodingBuffer = null;

  private synchronized byte[] decode(String rawData) {
    final var BLOCK_SIZE = 4 * 1024;

    var ogLen = (rawData.length() / 4) * 3; // (lucas) might be slightly above above the og len since b64 is padded, but that should be fine
    var bufferSize = (ogLen / BLOCK_SIZE + 1) * BLOCK_SIZE;
    if(decodingBuffer == null || decodingBuffer.length < bufferSize) {
      decodingBuffer = new byte[bufferSize];
    }
    // (lucas 16.02.21) todo: get around the array allocation on string.getBytes while also being able to specify the encoding
    var decodedLen = Base64.getDecoder().decode(rawData.getBytes(), decodingBuffer);
    return new String(decodingBuffer, 0, decodedLen, StandardCharsets.ISO_8859_1).getBytes(StandardCharsets.UTF_8);
  }
}
