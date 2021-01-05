package de.kettcards.web2print.imports;

import de.kettcards.web2print.model.db.AspectRatio;
import de.kettcards.web2print.model.db.Card;
import de.kettcards.web2print.model.db.Fold;
import de.kettcards.web2print.model.db.Material;
import de.kettcards.web2print.model.projectons.CardOverview;
import de.kettcards.web2print.repository.AspectRatioRepository;
import de.kettcards.web2print.repository.CardRepository;
import de.kettcards.web2print.repository.MaterialRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
public class XLSXImporter {

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private AspectRatioRepository aspectRatioRepository;


    public Map<Integer, AspectRatio> updateRatios(List<CardFormat> cardFormats) {
        //get db ratios
        List<Integer> ratioHashes = aspectRatioRepository.findAll().stream().map(AspectRatio::hashCode).collect(Collectors.toList());
        ArrayList<CardFormat> uniqueCardFormats = new ArrayList<>();
        Map<Integer, AspectRatio> ratioMap = new HashMap<>();
        for (CardFormat data : cardFormats) {
            if (!ratioHashes.contains(data.toAspectRatio())) {
                uniqueCardFormats.add(data);
                ratioMap.put(data.getFormatTyp(), data.toAspectRatio());

            }
        }

        //write new/update existing entries to db
        var dbRatios = aspectRatioRepository.saveAll(ratioMap.entrySet().stream().map(CardFormat::toAspectRatio).collect(Collectors.toList()));
        return ratioMap; //TODO return actual thing
    }

    public void importXlsx(FileInputStream stream) throws IOException {

        XSSFWorkbook workBook = new XSSFWorkbook(stream);

        //entries for each table inside xlsx sheet
        ArrayList<CardFormat> cardFormatSheetData = new ArrayList<>();
        ArrayList<CardOverviewData> cardOverviewSheetData = new ArrayList<>();
        ArrayList<TexturSheetData> textureSheetData = new ArrayList<>();
        ArrayList<DruckArt> druckArtSheetData = new ArrayList<>();

        parseFormat(workBook, cardFormatSheetData, cardOverviewSheetData, textureSheetData, druckArtSheetData);

        //format id -> db id -> format


        //TODO fine
        //update db with available materials
        List<Material> materials = materialRepository.findAll();
        List<Integer> materialHashes = materials.stream().map(Material::hashCode).collect(Collectors.toList());
        ArrayList<Material> materialTransfer = new ArrayList<>();
        for (TexturSheetData data : textureSheetData) {
            Material material = new Material();
            material.setId(data.getIndex());
            material.setName(data.getDescription()); //TODO check if related data was successfuly uploaded and has a valid format
            material.setTiling("stretch");
            materialRepository.save(material);
        }

        //TODO movives

        var cards = cardRepository.findAllProjectedBy(CardOverview.class);
        for (CardOverviewData data : cardOverviewSheetData) {
            var orderId = data.artikelNr;
            if (cards.contains())
            Card card = new Card();
            card.setOrderId(data.getArtikelNr());

            card.setMaterial(materialRepository.findMaterialById(data.getTextur()));
            card.setName(data.getTitel());
            card.setThumbSlug(data.getBildLink());

            AspectRatio ratio = new AspectRatio();
            CardFormat cardFormat = findCardFormat(uniqueCardFormats, data.getKartenformat());
            ratio.setHeight(cardFormat.heightInMM);
            ratio.setWidth(cardFormat.widthInMM);
            ratio.setName(cardFormat.description);
            card.setAspectRatio(ratio);

            log.info("formattyp " + cardFormat.formatTyp);

            ArrayList<Fold> folds = new ArrayList<>();
            Fold foldAdded = new Fold();
            foldAdded.setAngle(45);
            if (cardFormat.folded.equals("links")) {
                foldAdded.setX1(cardFormat.widthInMM);
                foldAdded.setY1(0);
                foldAdded.setX2(cardFormat.widthInMM);
                foldAdded.setY2(cardFormat.heightInMM);
            }
            cardRepository.save(card);
            card = cardRepository.findCardByOrderId(card.getOrderId());
            foldAdded.setCardId(card.getId());
            folds.add(foldAdded);

            card.setFolds(folds);

            cardRepository.save(card);
        }

        ArrayList<Fold> folds = new ArrayList<>();

        log.info("Dumped data");
    }

    private void parseFormat(XSSFWorkbook workBook, ArrayList<CardFormat> cardFormatSheetData,
                             List<CardOverviewData> cardOverviewSheetData,
                             List<TexturSheetData> textureSheetData, ArrayList<DruckArt> druckArtSheetData) {

        ArrayList<Integer> allowedFormatTypes = new ArrayList<>();
        List<String> allowedFolds = Arrays.asList("links", "oben");
        XSSFSheet cardFormatSheet = workBook.getSheet("Kartenformate");
        fillCardFormatData(cardFormatSheet, cardFormatSheetData, (ArrayList<String>) allowedFolds, allowedFormatTypes);

        XSSFSheet cardOverviewSheet = workBook.getSheet("Kartenübersicht");
        fillCardOverviewDataRows(cardOverviewSheet, (ArrayList<CardOverviewData>) cardOverviewSheetData, allowedFormatTypes);

        XSSFSheet textureSheet = workBook.getSheet("Textur");
        fillTextureDataRows(textureSheet, (ArrayList<TexturSheetData>) textureSheetData);

        XSSFSheet druckartSheet = workBook.getSheet("Druckart");
        fillDruckartData(druckartSheet, druckArtSheetData);

    }

    private CardFormat findCardFormat(List<CardFormat> cardFormats, int formatTyp) {
        for (CardFormat cardFormat : cardFormats) {
            if (cardFormat.getFormatTyp() == formatTyp)
                return cardFormat;
        }
        return null;
    }

    private void fillDruckartData(XSSFSheet druckartSheet, ArrayList<DruckArt> druckArtSheetData) {
        for (int i = 2; i <= druckartSheet.getLastRowNum(); i++) {
            int druckart = (int) druckartSheet.getRow(i).getCell(0).getNumericCellValue();
            String description = druckartSheet.getRow(i).getCell(1).getStringCellValue();
            druckArtSheetData.add(new DruckArt(druckart, description));
        }
    }

    private void fillCardFormatData(XSSFSheet cardFormatSheet, ArrayList<CardFormat> cardFormatSheetData,
                                    ArrayList<String> allowedFolds, ArrayList<Integer> allowedFormatTypes) {
        for (int i = 1; i <= cardFormatSheet.getLastRowNum(); i++) {
            int formatTyp = (int) cardFormatSheet.getRow(i).getCell(0).getNumericCellValue();
            int heightInMM = (int) cardFormatSheet.getRow(i).getCell(1).getNumericCellValue();
            int widthInMM = (int) cardFormatSheet.getRow(i).getCell(2).getNumericCellValue();
            String folded = cardFormatSheet.getRow(i).getCell(3).getStringCellValue();
            //String open = cardFormatSheet.getRow(i).getCell(4).getStringCellValue();
            //String description = cardFormatSheet.getRow(i).getCell(5).getStringCellValue();
            if (allowedFolds.contains(folded)) {
                allowedFormatTypes.add(formatTyp);
                cardFormatSheetData.add(new CardFormat(formatTyp, heightInMM, widthInMM, folded,
                        null, null));
            }
        }
    }

    private void fillTextureDataRows(XSSFSheet textureSheet, ArrayList<TexturSheetData> textureSheetData) {
        for (int i = 1; i <= textureSheet.getLastRowNum(); i++) {
            int index = (int) textureSheet.getRow(i).getCell(0).getNumericCellValue();
            String description = textureSheet.getRow(i).getCell(1).getStringCellValue();
            textureSheetData.add(new TexturSheetData(index, description));
        }
    }

    private void fillCardOverviewDataRows(XSSFSheet cardOverview, ArrayList<CardOverviewData> cardOverviewSheetData,
                                          ArrayList<Integer> allowedFormatTypes) {
        for (int i = 1; i <= cardOverview.getLastRowNum(); i++) {
            String artikelNr = cardOverview.getRow(i).getCell(0).getStringCellValue();
            int kartenformat = (int) cardOverview.getRow(i).getCell(1).getNumericCellValue();
            int textur = (int) cardOverview.getRow(i).getCell(2).getNumericCellValue();
            int druckart = (int) cardOverview.getRow(i).getCell(3).getNumericCellValue();
            String anmerkungen = cardOverview.getRow(i).getCell(4).getStringCellValue();
            String titel = cardOverview.getRow(i).getCell(5).getStringCellValue();
            String urlBeiKettcards = cardOverview.getRow(i).getCell(6).getStringCellValue();
            String titelVariante = cardOverview.getRow(i).getCell(7).getStringCellValue();
            String bildLink = cardOverview.getRow(i).getCell(8).getStringCellValue();
            String shopMetaDescription = cardOverview.getRow(i).getCell(9).getStringCellValue();
            String shopMetaTitle = cardOverview.getRow(i).getCell(10).getStringCellValue();
            if (allowedFormatTypes.contains(kartenformat))
                cardOverviewSheetData.add(new CardOverviewData(artikelNr, kartenformat, textur, druckart, anmerkungen,
                        titel, urlBeiKettcards, titelVariante, bildLink, shopMetaDescription, shopMetaTitle));
        }
    }

    private class CardOverviewData {

        String artikelNr;
        int kartenformat;
        int textur;
        int druckart;
        String anmerkungen;
        String titel;
        String urlBeiKettcards;
        String titelVariante;
        String bildLink;
        String shopMetaDescription;
        String shopMetaTitle;

        public CardOverviewData(String artikelNr, int kartenformat, int textur, int druckart, String anmerkungen,
                                String titel, String urlBeiKettcards, String titelVariante, String bildLink,
                                String shopMetaDescription, String shopMetaTitle) {
            this.artikelNr = artikelNr;
            this.kartenformat = kartenformat;
            this.textur = textur;
            this.druckart = druckart;
            this.anmerkungen = anmerkungen;
            this.titel = titel;
            this.urlBeiKettcards = urlBeiKettcards;
            this.titelVariante = titelVariante;
            this.bildLink = bildLink;
            this.shopMetaDescription = shopMetaDescription;
            this.shopMetaTitle = shopMetaTitle;
        }

        public String getArtikelNr() {
            return artikelNr;
        }

        public int getKartenformat() {
            return kartenformat;
        }

        public int getTextur() {
            return textur;
        }

        public int getDruckart() {
            return druckart;
        }

        public String getAnmerkungen() {
            return anmerkungen;
        }

        public String getTitel() {
            return titel;
        }

        public String getUrlBeiKettcards() {
            return urlBeiKettcards;
        }

        public String getTitelVariante() {
            return titelVariante;
        }

        public String getBildLink() {
            return bildLink;
        }

        public String getShopMetaDescription() {
            return shopMetaDescription;
        }

        public String getShopMetaTitle() {
            return shopMetaTitle;
        }
    }

    private class TexturSheetData {

        int index;
        String description;

        public TexturSheetData(int index, String description) {
            this.index = index;
            this.description = description;
        }

        public int getIndex() {
            return index;
        }

        public String getDescription() {
            return description;
        }
    }

    private class CardFormat {

        int formatTyp;
        int heightInMM;
        int widthInMM;
        String folded;
        String open;
        String description;

        public CardFormat(int formatTyp, int heightInMM, int widthInMM, String folded, String open, String description) {
            this.formatTyp = formatTyp;
            this.heightInMM = heightInMM;
            this.widthInMM = widthInMM;
            this.folded = folded;
            this.open = open;
            this.description = description;
        }

        public int getFormatTyp() {
            return formatTyp;
        }

        public AspectRatio toAspectRatio() {
            var ratio = new AspectRatio();
            ratio.setName(description);
            if (folded.equals("oben")) {
                ratio.setHeight(heightInMM * 2);
                ratio.setWidth(widthInMM);
            }
            if (folded.equals("links")) {
                ratio.setHeight(heightInMM);
                ratio.setWidth(widthInMM * 2);
            }
            return ratio;
        }

        public Fold toFold() {
            Fold foldAdded = new Fold();
            foldAdded.setAngle(45);
            switch (folded) {
                case "links":
                    foldAdded.setX1(widthInMM / 2);
                    foldAdded.setY1(0);
                    foldAdded.setX2(widthInMM / 2);
                    foldAdded.setY2(heightInMM);
                    break;
                case "oben":
                    foldAdded.setX1(0);
                    foldAdded.setY1(heightInMM / 2);
                    foldAdded.setX2(widthInMM);
                    foldAdded.setY2(heightInMM / 2);
            }
            return foldAdded;
        }

    }

    private class DruckArt {

        int druckart;
        String description;

        public DruckArt(int druckart, String description) {
            this.druckart = druckart;
            this.description = description;
        }

        public int getDruckart() {
            return druckart;
        }

        public String getDescription() {
            return description;
        }
    }
}
