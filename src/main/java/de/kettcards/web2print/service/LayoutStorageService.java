package de.kettcards.web2print.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import de.kettcards.web2print.model.db.CardFormat;
import de.kettcards.web2print.pdfGen.PDFGenerator;
import de.kettcards.web2print.repository.CardRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.ParseException;
import java.util.Base64;
import java.util.UUID;
import java.util.function.Function;

@Slf4j
@Service
public class LayoutStorageService {
  private final ObjectMapper jsonMapper;
  private final Path         storagePath;

  @Autowired
  private PDFGenerator generator;
  @Autowired
  private CardRepository cardRepository;

  public LayoutStorageService() throws IOException {
    jsonMapper  = new ObjectMapper();
    storagePath = Path.of("./pdf_output");
    Files.createDirectories(storagePath);
    //this.cardRepository = cardRepository;
  }

  /**
   * @param storageId storage id to override, may be null for new layouts
   * @param cardData base64 encoded json card data string
   * @return a storage id for retrieving this data
   */
  public String StoreCard(String storageId, String cardData) {
    return "0000";
  }

  /**
   * @param cardData base64 encoded json card data string
   */
  public void ExportCard(String cardData) throws IOException, ParseException {
    var data = Base64.getDecoder().decode(cardData); //(lucas 18.01.21) mbe reuse the byte array
    var rootNode = jsonMapper.readValue(data, ObjectNode.class);

    //(lucas) could be better with the repository
    //(lucas 18.01.21) todo: move the format resolver in the constructor since its not static anymore
    try(var document = generator.generateFromJSON(rootNode, this::resolveFormat)) {
      var resourceName = UUID.randomUUID().toString();
      document.save(storagePath.resolve(resourceName).toFile() + ".pdf");
    }
  }

  private CardFormat resolveFormat(String cardId) {
    return cardRepository.findCardByOrderId(cardId).getCardFormat();
  }
}
