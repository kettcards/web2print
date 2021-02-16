package de.kettcards.web2print.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.kettcards.web2print.pdf.CardData;
import de.kettcards.web2print.pdf.PDFGenerator;
import de.kettcards.web2print.storage.Content;
import de.kettcards.web2print.storage.StorageContextAware;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.util.InMemoryResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.util.Base64;
import java.util.Collections;

@Slf4j
@Service
public final class LayoutStorageService extends StorageContextAware {

    @Autowired
    private ObjectMapper jsonMapper;

    @Autowired
    private PDFGenerator generator;

    public LayoutStorageService() throws IOException {

    }

    /**
     * @param storageId storage id to override, may be null for new layouts
     * @param cardData  base64 encoded json card data string
     * @return a storage id for retrieving this data
     */
    public String StoreCard(String storageId, String cardData) {
        return "0000";
    }

    /**
     * @param rawData base64 encoded json card data string
     * @throws IOException    if pdf creation was unsuccessful
     * @throws ParseException invalid rawData
     */
    public void ExportCard(String rawData) throws IOException, ParseException {
        var asciiData = Base64.getDecoder().decode(rawData); //(lucas 18.01.21) mbe reuse the byte array
        var data = new String(asciiData, StandardCharsets.ISO_8859_1).getBytes(StandardCharsets.UTF_8);
        var cardData = jsonMapper.readValue(data, CardData.class);

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

}
