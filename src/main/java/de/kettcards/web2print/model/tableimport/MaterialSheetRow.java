package de.kettcards.web2print.model.tableimport;

import de.kettcards.web2print.model.db.Material;
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
public final class MaterialSheetRow implements VirtualId {

    private Integer id;

    private String name;

    public static List<MaterialSheetRow> parseRows(XSSFSheet materialSheet) {
        var data = new ArrayList<MaterialSheetRow>();
        for (Row row : materialSheet) {
            try {
                int index = (int) row.getCell(0).getNumericCellValue();
                String description = row.getCell(1).getStringCellValue();
                data.add(new MaterialSheetRow(index, description));
            } catch (IllegalStateException | NullPointerException e) {
                log.error("Row of sheet " + materialSheet.getSheetName() + " with following cells wasn't imported:");
                StringBuilder tmp = new StringBuilder();
                for (Cell cell : row) {
                    tmp.append(cell).append("|");
                }
                log.error(tmp.toString());
            }
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
