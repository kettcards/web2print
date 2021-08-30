package de.kettcards.web2print.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.kettcards.web2print.model.OrderFormData;
import de.kettcards.web2print.pdf.CardData;
import de.kettcards.web2print.pdf.PDFGenerator;
import de.kettcards.web2print.storage.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.security.util.InMemoryResource;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Supplier;

@Slf4j
@Service
// (lucas 16.02.21) by design of StorageContextAware we might want to split this into two separate services for storing / exporting
public final class OrderingService extends StorageContextAware {

    private final ObjectMapper jsonMapper;

    private final PDFGenerator generator;

    private final MailService mailService;

    public OrderingService(MailService mailService,
                           ObjectMapper jsonMapper,
                           PDFGenerator generator) {
        this.mailService = mailService;
        this.jsonMapper = jsonMapper;
        this.generator = generator;
    }

    /**
     * @param rawData base64 encoded json card data string
     * @throws IOException if pdf creation was unsuccessful
     */
    public void exportCard(String rawData, String rawAdditionalData) throws IOException, MessagingException {
        var cardData = jsonMapper.readValue(decode(rawData), CardData.class);
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

    public String exportCardToPdf(String cardId) throws IOException {
        var cardData = jsonMapper.readValue(decode(cardId), CardData.class);
        return exportCardToPdf(cardData);
    }

    public String exportCardToPdf(CardData cardData) throws IOException {

        try (PDDocument generate = generator.generate(cardData)) {
            var stream = new ByteArrayOutputStream();
            generate.save(stream);
            return save(new Content(new ByteArrayResource(stream.toByteArray()), "application/pdf", "generated.pdf"));
        }
    }

    private byte[] decode(String rawData) {
        byte[] decodingBuffer = null;
        final var BLOCK_SIZE = 4 * 1024;

        var ogLen = (rawData.length() / 4) * 3; // (lucas) might be slightly above above the og len since b64 is padded, but that should be fine
        var bufferSize = (ogLen / BLOCK_SIZE + 1) * BLOCK_SIZE;
        if (decodingBuffer == null || decodingBuffer.length < bufferSize) {
            decodingBuffer = new byte[bufferSize];
        }
        // (lucas 16.02.21) todo: get around the array allocation on string.getBytes while also being able to specify the encoding
        var decodedLen = Base64.getDecoder().decode(rawData.getBytes(), decodingBuffer);
        return new String(decodingBuffer, 0, decodedLen, StandardCharsets.ISO_8859_1).getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public String getNamespace() {
        return "ordered";
    }

    @Override
    public boolean keepExtension() {
        return true;
    }

    @Override
    public Supplier<String> getNameGenerator() {
        var dateFormat = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");
        return () -> LocalDateTime.now().format(dateFormat);
    }
}
