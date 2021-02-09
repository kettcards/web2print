package de.kettcards.web2print.model.tableimport;

import de.kettcards.web2print.model.db.CardFormat;
import de.kettcards.web2print.model.db.Fold;
import de.kettcards.web2print.model.db.VirtualId;
import lombok.AllArgsConstructor;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Value
@AllArgsConstructor
@Slf4j
public class CardFormatSheetRow implements VirtualId {

    String nameExplanation;

    Integer formatType, height, width;

    String foldType;

    public static List<CardFormatSheetRow> parseRows(XSSFSheet cardFormatSheet) {
        var data = new ArrayList<CardFormatSheetRow>();
        for (Row row : cardFormatSheet) {
            try {
                int formatTyp = (int) row.getCell(0).getNumericCellValue();
                int heightInMM = (int) row.getCell(1).getNumericCellValue();
                int widthInMM = (int) row.getCell(2).getNumericCellValue();
                String folded = row.getCell(3).getStringCellValue();
                String name = "";
                if (row.getCell(5) != null)
                    name = row.getCell(5).getStringCellValue();
                if (name == null)
                    name = "";
                data.add(new CardFormatSheetRow(name, formatTyp, heightInMM, widthInMM, folded));
            } catch (IllegalStateException | NullPointerException e) {
                log.error("Row of sheet " + cardFormatSheet.getSheetName() + " with following cells wasn't imported:");
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
        return formatType;
    }

    @Override
    public int getVirtualHash() {
        return Objects.hash(height, width, foldType);
    }

    public CardFormat toCardFormat() throws IllegalArgumentException {
        var ratio = new CardFormat();
        ratio.setName(nameExplanation); //TODO add name with parser
        //Fold.Type type = Fold.Type.valueOf(foldType); //TODO check more dynamically
        switch (foldType) {
            case "links":
                ratio.setHeight(height);
                ratio.setWidth(width * 2);
                break;
            case "oben":
                ratio.setHeight(height * 2);
                ratio.setWidth(width);
                break;
            default:
                throw new IllegalArgumentException("unknown fold type: " + foldType);
        }
        return ratio;
    }

    public Fold toFold(CardFormat format) throws IllegalArgumentException {
        var fold = new Fold();
        fold.setCardFormat(format);
        fold.setAngle(45); //TODO make angle changeable
        switch (foldType) { //TODO check more dynamically
            case "links":
                fold.setX1(width);
                fold.setY1(0);
                fold.setX2(width);
                fold.setY2(height);
                break;
            case "oben":
                fold.setX1(0);
                fold.setY1(height);
                fold.setX2(width);
                fold.setY2(height);
                break;
            default:
                return null;
            //throw new IllegalArgumentException("unknown fold type: " + foldType);
        }
        return fold;
    }

}
