package de.kettcards.web2print.model.tableimport;

import de.kettcards.web2print.model.db.*;
import lombok.AllArgsConstructor;
import lombok.Value;
import org.apache.poi.xssf.usermodel.XSSFSheet;

import java.util.ArrayList;
import java.util.List;

@Value
@AllArgsConstructor
public class CardOverviewSheetRow implements VirtualId {

    String orderId;

    Integer cardFormat;

    Integer texture;

    Integer printType;

    String title;

    String thumbnailUrl;

    public static List<CardOverviewSheetRow> parseRows(XSSFSheet cardOverviewSheet) {
        var data = new ArrayList<CardOverviewSheetRow>();
        for (int i = 1; i <= cardOverviewSheet.getLastRowNum(); i++) {
            String artikelNr = cardOverviewSheet.getRow(i).getCell(0).getStringCellValue();
            int kartenformat = (int) cardOverviewSheet.getRow(i).getCell(1).getNumericCellValue();
            int textur = (int) cardOverviewSheet.getRow(i).getCell(2).getNumericCellValue();
            int druckart = (int) cardOverviewSheet.getRow(i).getCell(3).getNumericCellValue();
            String anmerkungen = cardOverviewSheet.getRow(i).getCell(4).getStringCellValue();
            String titel = cardOverviewSheet.getRow(i).getCell(5).getStringCellValue();
            String urlBeiKettcards = cardOverviewSheet.getRow(i).getCell(6).getStringCellValue();
            String titelVariante = cardOverviewSheet.getRow(i).getCell(7).getStringCellValue();
            String bildLink = cardOverviewSheet.getRow(i).getCell(8).getStringCellValue();
            String shopMetaDescription = cardOverviewSheet.getRow(i).getCell(9).getStringCellValue();
            String shopMetaTitle = cardOverviewSheet.getRow(i).getCell(10).getStringCellValue();
            data.add(new CardOverviewSheetRow(artikelNr, kartenformat, textur, null, titel, bildLink));
        }
        return data;
    }

    @Override
    public int getVirtualId() {
        return orderId.hashCode();
    }

    @Override
    public int getVirtualHash() {
        return orderId.hashCode();
    }

    public Card toCard(Material material, AspectRatio aspectRatio, List<Fold> folds) {
        Card card = new Card();
        card.setOrderId(orderId);
        card.setThumbSlug(thumbnailUrl.substring(thumbnailUrl.lastIndexOf("/") + 1)); //TODO impl properly
        card.setName(title);
        card.setAspectRatio(aspectRatio);
        card.setMaterial(material);
        card.setFolds(folds);
        return card;
    }

}