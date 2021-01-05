package de.kettcards.web2print.model.tableimport;

import de.kettcards.web2print.model.db.Material;
import de.kettcards.web2print.model.db.VirtualId;
import lombok.AllArgsConstructor;
import lombok.Value;
import org.apache.poi.xssf.usermodel.XSSFSheet;

import java.util.ArrayList;
import java.util.List;

@Value
@AllArgsConstructor
public class MaterialSheetRow implements VirtualId {

    Integer id;

    String name;

    public static List<MaterialSheetRow> parseRows(XSSFSheet materialSheet) {
        var data = new ArrayList<MaterialSheetRow>();
        for (int i = 1; i <= materialSheet.getLastRowNum(); i++) {
            int index = (int) materialSheet.getRow(i).getCell(0).getNumericCellValue();
            String description = materialSheet.getRow(i).getCell(1).getStringCellValue();
            data.add(new MaterialSheetRow(index, description));
        }
        return data;
    }

    public Material toMaterial() {
        var material = new Material();
        material.setName(name);
        material.setTiling("stretch");
        return material;
    }

    @Override
    public int getVirtualId() {
        return id;
    }

    @Override
    public int getVirtualHash() {
        return id.hashCode();
    }


}
