package de.kettcards.web2print.pdfGen.cardData;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Value;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.core.io.FileSystemResource;

import java.awt.*;
import java.io.IOException;
import java.util.List;

import static de.kettcards.web2print.pdfGen.PDFGenerator.mm2pt;


public class ImageBoxData extends BoxData{
    @Getter
    FileSystemResource img; //TODO: clarify if the File comes through or the Path

    public ImageBoxData(float x, float y, float w, float h, FileSystemResource img) {
        super(x,y,w,h);
        this.img = img;
    }

    @Override
    public void applyTo(PDDocument doc, PDPageContentStream content) throws IOException {
        var box = this;
        PDImageXObject img = PDImageXObject.createFromFileByContent(box.getImg().getFile(),doc);
        Dimension scaledDim = getScaledDimension(new Dimension(img.getWidth(), img.getHeight()), new Dimension((int)mm2pt(box.getWInMM()), (int)mm2pt(box.getHInMM())));
        content.drawImage(img,box.getXInPt(), box.getYInPt(), scaledDim.width, scaledDim.height);
    }

    private Dimension getScaledDimension(Dimension imgSize, Dimension boundary){
        int original_width = imgSize.width;
        int original_height = imgSize.height;
        int bound_width = boundary.width;
        int bound_height = boundary.height;
        int new_width = original_width;
        int new_height = original_height;

        // first check if we need to scale width
        if (original_width > bound_width) {
            //scale width to fit
            new_width = bound_width;
            //scale height to maintain aspect ratio
            new_height = (new_width * original_height) / original_width;
        }

        // then check if we need to scale even with the new height
        if (new_height > bound_height) {
            //scale height to fit instead
            new_height = bound_height;
            //scale width to maintain aspect ratio
            new_width = (new_height * original_width) / original_height;
        }

        return new Dimension(new_width, new_height);
    }
}
