package de.kettcards.web2print.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;

@Slf4j
@Service
public class MotiveScaleService {

    /**
     *
     * @param inputStream inputstream for pdf file
     * @param front path to front image
     * @param back path to back image
     * @throws IOException
     */
    //very basic impl
    public void saveAndScaleImage(InputStream inputStream, Path front, Path back) throws IOException {
        PDDocument document = PDDocument.load(inputStream);
        if (document.getNumberOfPages() > 2)
            throw new IOException("pdf file shouldn't have more than 2 sides (front & back)");
        int numberOfPages = document.getNumberOfPages();
        for (int i = 0; i < numberOfPages; i++) {
            PDPage page = document.getPage(i);
            page.setMediaBox(page.getTrimBox()); //should work if pdf is valid
            PDFRenderer renderer = new PDFRenderer(document);
            BufferedImage bufferedImage = renderer.renderImage(i, 1, ImageType.ARGB);
            Path out;
            if (i == 0) {
                out = front;
            } else {
                out = back;
            }
            ImageIO.write(bufferedImage, "png", out.toFile());
        }

    }

}
