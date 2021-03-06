package de.kettcards.web2print.model.tableimport;

import de.kettcards.web2print.model.db.Card;
import de.kettcards.web2print.model.db.CardFormat;
import de.kettcards.web2print.model.db.Texture;
import de.kettcards.web2print.model.db.VirtualId;
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
public final class CardOverviewSheetRow implements VirtualId {

    private String orderId;

    private Integer cardFormat;

    private Integer texture;

    private Integer printType;

    private String title;

    private String thumbnailUrl;

    public static List<CardOverviewSheetRow> parseRows(XSSFSheet cardOverviewSheet) {
        var data = new ArrayList<CardOverviewSheetRow>();
        for (Row row : cardOverviewSheet) {
            try {
                String artikelNr = row.getCell(0).getStringCellValue();
                int kartenformat = (int) row.getCell(1).getNumericCellValue();
                int textur = (int) row.getCell(2).getNumericCellValue();
                String titel = row.getCell(5).getStringCellValue();
                String bildLink = row.getCell(8).getStringCellValue();
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

    public Card toCard(Texture texture, CardFormat cardFormat) {
        Card card = new Card();
        card.setOrderId(orderId);
        card.setThumbSlug(thumbnailUrl.substring(thumbnailUrl.lastIndexOf("/") + 1)); //TODO impl properly
        card.setName(title);
        card.setCardFormat(cardFormat);
        card.setTexture(texture);
        return card;
    }

}