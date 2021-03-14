package de.kettcards.web2print.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.kettcards.web2print.pdf.CardData;
import de.kettcards.web2print.pdf.PDFGenerator;
import de.kettcards.web2print.storage.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.util.InMemoryResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Supplier;

@Slf4j
@Service
// (lucas 16.02.21) by design of StorageContextAware we might want to split this into two separate services for storing / exporting
public final class LayoutStorageService extends StorageContextAware {

    @Autowired
    private ObjectMapper jsonMapper;

    @Autowired
    private PDFGenerator generator;

    public LayoutStorageService() {

    }

    /**
     * @param storageId storage id to override, may be null for new layouts
     * @param cardData  base64 encoded json card data string
     * @return a storage id for retrieving this data
     */
    public String storeCard(String storageId, String cardData) throws IOException {
        var constraints = new LinkedList<StorageConstraint>();
        //constraints.add(new MaxAgeConstraint(Period.ofMonths(1))); // (lucas 15.02.21) todo: implement maxAgeConstraint
        var content = new Content(new InMemoryResource(cardData), "application/octet-stream", null, constraints);
        if(storageId == null) {
            return save(content);
        } else {
            save(content, storageId);
            return storageId;
        }
    }

    public String loadCard(String storageId) throws IOException {
        try(var stream = load(storageId).getInputStream()) {
            return IOUtils.toString(stream);
        }
    }

    private byte[] decodingBuffer = null;
    /**
     * @param rawData base64 encoded json card data string
     * @throws IOException    if pdf creation was unsuccessful
     */
    public void exportCard(String rawData) throws IOException {
        final var BLOCK_SIZE = 4 * 1024;

        var ogLen = (rawData.length() / 4) * 3; // (lucas) might be slightly above above the og len since b64 is padded, but that should be fine
        var bufferSize = (ogLen / BLOCK_SIZE + 1) * BLOCK_SIZE;
        if(decodingBuffer == null || decodingBuffer.length < bufferSize) {
            decodingBuffer = new byte[bufferSize];
        }
        // (lucas 16.02.21) todo: get around the array allocation on string.getBytes while also being able to specify the encoding
        var decodedLen = Base64.getDecoder().decode(rawData.getBytes(), decodingBuffer);
        var utf8JsonData = new String(decodingBuffer, 0, decodedLen, StandardCharsets.ISO_8859_1).getBytes(StandardCharsets.UTF_8);
        var cardData = jsonMapper.readValue(utf8JsonData, CardData.class);

        try (PDDocument generate = generator.generate(cardData)) {
            var stream = new ByteArrayOutputStream();
            generate.save(stream);
            save(new Content(new InMemoryResource(stream.toByteArray()), "application/pdf", "generated.pdf", Collections.emptyList()));

        }

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
        var dateFormat = DateTimeFormatter.ofPattern("yyyy-MM-dd_HH:mm:ss");
        return () -> LocalDate.now().format(dateFormat);
    }
}
