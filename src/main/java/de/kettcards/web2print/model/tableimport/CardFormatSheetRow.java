package de.kettcards.web2print.model.tableimport;

import de.kettcards.web2print.model.db.AspectRatio;
import de.kettcards.web2print.model.db.Fold;
import de.kettcards.web2print.model.db.VirtualId;
import lombok.AllArgsConstructor;
import lombok.Value;
import org.apache.poi.xssf.usermodel.XSSFSheet;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Value
@AllArgsConstructor
public class CardFormatSheetRow implements VirtualId {

    String nameExplanation;

    Integer formatType, height, width;

    String foldType;

    public static List<CardFormatSheetRow> parseRows(XSSFSheet cardFormatSheet) {
        var data = new ArrayList<CardFormatSheetRow>();
        for (int i = 1; i <= cardFormatSheet.getLastRowNum(); i++) {
            int formatTyp = (int) cardFormatSheet.getRow(i).getCell(0).getNumericCellValue();
            int heightInMM = (int) cardFormatSheet.getRow(i).getCell(1).getNumericCellValue();
            int widthInMM = (int) cardFormatSheet.getRow(i).getCell(2).getNumericCellValue();
            String folded = cardFormatSheet.getRow(i).getCell(3).getStringCellValue();
            String name = "";
            if (cardFormatSheet.getRow(i).getCell(5) != null)
                name = cardFormatSheet.getRow(i).getCell(5).getStringCellValue();
            if (name == null)
                name = "";
            data.add(new CardFormatSheetRow(name, formatTyp, heightInMM, widthInMM, folded));
        }
        return data;
    }

    @Override
    public int getVirtualId() {
        return formatType;
    }

    @Override
    public int getVirtualHash() {
        return Objects.hash(height, width,foldType);
    }

    public AspectRatio toAspectRatio() throws IllegalArgumentException {
        var ratio = new AspectRatio();
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

    public Fold toFold() throws IllegalArgumentException {
        var fold = new Fold();
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
