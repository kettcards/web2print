package de.kettcards.web2print.model.tableimport;

import de.kettcards.web2print.model.db.*;
import lombok.AllArgsConstructor;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;

import java.util.ArrayList;
import java.util.List;

@Value
@AllArgsConstructor
@Slf4j
public class CardOverviewSheetRow implements VirtualId {

    String orderId;

    Integer cardFormat;

    Integer texture;

    Integer printType;

    String title;

    String thumbnailUrl;

    public static List<CardOverviewSheetRow> parseRows(XSSFSheet cardOverviewSheet) {
        var data = new ArrayList<CardOverviewSheetRow>();
        for (Row row : cardOverviewSheet) {
            try {
                String artikelNr = row.getCell(0).getStringCellValue();
                int kartenformat = (int) row.getCell(1).getNumericCellValue();
                int textur = (int) row.getCell(2).getNumericCellValue();
                int druckart = (int) row.getCell(3).getNumericCellValue();
                String anmerkungen = row.getCell(4).getStringCellValue();
                String titel = row.getCell(5).getStringCellValue();
                String urlBeiKettcards = row.getCell(6).getStringCellValue();
                String titelVariante = row.getCell(7).getStringCellValue();
                String bildLink = row.getCell(8).getStringCellValue();
                String shopMetaDescription = row.getCell(9).getStringCellValue();
                String shopMetaTitle = row.getCell(10).getStringCellValue();
                data.add(new CardOverviewSheetRow(artikelNr, kartenformat, textur, null, titel, bildLink));
            } catch (IllegalStateException | NullPointerException e) {
                log.error("Row of sheet " + cardOverviewSheet.getSheetName() + " with following cells wasn't imported:");
                StringBuilder tmp = new StringBuilder();
                for (Cell cell : row) {
                    tmp.append(cell).append("|");
                }
                log.error(tmp.toString());
            }
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

    public Card toCard(Material material, CardFormat cardFormat) {
        Card card = new Card();
        card.setOrderId(orderId);
        card.setThumbSlug(thumbnailUrl.substring(thumbnailUrl.lastIndexOf("/") + 1)); //TODO impl properly
        card.setName(title);
        card.setCardFormat(cardFormat);
        card.setMaterial(material);
        return card;
    }

}