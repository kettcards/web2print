package de.kettcards.web2print.service;

import de.kettcards.web2print.model.db.*;
import de.kettcards.web2print.model.projectons.CardOverview;
import de.kettcards.web2print.model.tableimport.CardFormatSheetRow;
import de.kettcards.web2print.model.tableimport.CardOverviewSheetRow;
import de.kettcards.web2print.model.tableimport.MaterialSheetRow;
import de.kettcards.web2print.repository.CardFormatRepository;
import de.kettcards.web2print.repository.CardRepository;
import de.kettcards.web2print.repository.FoldRepository;
import de.kettcards.web2print.repository.MaterialRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
public class XlsxImportService {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private CardFormatRepository cardFormatRepository;

    @Autowired
    private FoldRepository foldRepository;

    public void importCards(InputStream xlsxFile) throws IOException {
        XSSFWorkbook workBook = new XSSFWorkbook(xlsxFile);

        List<MaterialSheetRow> textur = MaterialSheetRow.parseRows(workBook.getSheet("Textur"));
        List<CardFormatSheetRow> formatRows = CardFormatSheetRow.parseRows(workBook.getSheet("Kartenformate"));
        List<CardOverviewSheetRow> cardOverviewRows = CardOverviewSheetRow.parseRows(workBook.getSheet("Kartenübersicht"));

        //filters out non-supported types, TODO: entweder in ner Config-File oder im Verwaltungswerkzeug änderbar machen
        formatRows = formatRows.stream().filter(cardFSRow -> cardFSRow.getFoldType().equals("links") || cardFSRow.getFoldType().equals("oben"))
                .collect(Collectors.toList());
        List<Integer> allowedFormats = formatRows.stream().map(CardFormatSheetRow::getFormatType).collect(Collectors.toList());
        cardOverviewRows = cardOverviewRows.stream().filter(row -> allowedFormats.contains(row.getCardFormat())).collect(Collectors.toList());


        var texturVirtualMapper = buildVirtualMap(materialRepository, textur, MaterialSheetRow::toMaterial);
        var cardFormatVirtualMapper = buildVirtualMap(cardFormatRepository, formatRows, CardFormatSheetRow::toCardFormat);
        buildVirtualMap(foldRepository, formatRows,
                cardFSRow -> {
                    int virtualId = cardFSRow.getVirtualId();
                    return cardFSRow.toFold(cardFormatVirtualMapper.get(virtualId));
                });

        //var cardVirtualMapper = buildVirtualMap(cardRepository, cardOverviewRows, CardOverviewSheetRow::toCard);

        //query db for all cards
        List<CardOverview> cardsInsideDb = cardRepository.findAllProjectedBy(CardOverview.class);

        for (var sheetCard : cardOverviewRows) {
            //is card inside db
            try {
                Card targetCard = null;
                for (var dbcard : cardsInsideDb) {
                    if (dbcard.isVirtuallyEqual(sheetCard)) {
                        targetCard = cardRepository.findCardByOrderId(dbcard.getOrderId());
                        break;
                    }
                }

                if (targetCard == null) { //new card
                    Integer formatId = sheetCard.getCardFormat();
                    Integer textureId = sheetCard.getTexture();
                    CardFormat cardFormat = cardFormatVirtualMapper.get(formatId);
                    Material material = texturVirtualMapper.get(textureId);
                    targetCard = sheetCard.toCard(material, cardFormat);
                } else { //overwrite existing card
                    Integer formatId = sheetCard.getCardFormat();
                    Integer textureId = sheetCard.getTexture();
                    CardFormat cardFormat = cardFormatVirtualMapper.get(formatId);
                    Material material = texturVirtualMapper.get(textureId);
                    var oldCardId = targetCard.getId();
                    targetCard = sheetCard.toCard(material, cardFormat);
                    targetCard.setId(oldCardId);

                }

                //skips cards with illegal format
                if (targetCard.getCardFormat() == null)
                    invalidCard(targetCard);

                //if (targetCard.getMaterial() == null)
                //    invalidCard(targetCard);

                log.debug("saving card: " + targetCard);
                Card saveCard = cardRepository.save(targetCard);
                //Fold fold = foldVirtualMapper.get(saveCard.getId());
                //fold.setCardId(saveCard.getId());
                //foldRepository.save(fold);
            } catch (IllegalArgumentException ex) {
                log.warn(ex.getMessage());
            }

        }
    }

    private void invalidCard(Card card) throws IllegalArgumentException {
        throw new IllegalArgumentException("unable to determine virtual mapping attribute address for card: " + card);
    }

    private <U extends VirtualId, V extends VirtualId> Map<Integer, U> buildVirtualMap(JpaRepository<U, Integer> repository,
                                                                                       List<V> vs,
                                                                                       Function<V, U> transformer) {
        Map<Integer, U> ret = new HashMap<>();

        List<U> alreadyExisting = repository.findAll();

        for (var rawFormatElement : vs) {
            U formatElement = null;
            try {
                formatElement = transformer.apply(rawFormatElement);
            } catch (IllegalArgumentException ex) {
                log.warn("skipping " + rawFormatElement);
            }
            if (formatElement == null)
                continue;
            //T formatElement = rawFormatElement.toAspectRatio();
            //Optional<AspectRatio> firstFormatElement = alreadyExisting.stream().filter(e -> e.equals(formatElement)).findFirst();
            U firstFormatElement = null;
            for (U existingFormatElement : alreadyExisting) {
                if (formatElement.isVirtuallyEqual(existingFormatElement)) {
                    firstFormatElement = existingFormatElement;
                    break;
                }
            }

            if (firstFormatElement != null) {
                //element exists
                log.info("raw element " + formatElement + " already exists under db id " +
                        firstFormatElement.getVirtualId() + ", mapped under virtual map id: " +
                        rawFormatElement.getVirtualId());
                ret.put(rawFormatElement.getVirtualId(), firstFormatElement);
            } else {
                //aspect ratio is new
                log.info("importing new element:" + formatElement);
                //create new aspect ratio
                U saveFormatElement = repository.save(formatElement);
                log.info("created new element with db id" + saveFormatElement.getVirtualId() +
                        ", mapped under virtual map id: " + rawFormatElement.getVirtualId());
                ret.put(rawFormatElement.getVirtualId(), saveFormatElement);
            }

        }
        return ret;
    }


}
