package de.kettcards.web2print.pdf;

import com.kitfox.svg.SVGDiagram;
import com.kitfox.svg.SVGException;
import com.kitfox.svg.SVGUniverse;
import de.kettcards.web2print.storage.Content;
import de.rototor.pdfbox.graphics2d.PdfBoxGraphics2D;
import org.apache.pdfbox.pdmodel.graphics.image.JPEGFactory;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.util.Matrix;

import javax.imageio.ImageIO;
import java.io.IOException;

/**
 * image node representation
 */
public class ImageBoxData extends BoxData {

    private final String contentId;

    public ImageBoxData(float x, float y, float width, float height, String contentId) {
        super(x, y, width, height);
        this.contentId = contentId;
    }

    /**
     * applies image data
     * @param doc document
     * @throws IOException if data cant be written into document
     */
    @Override
    public void apply(Document doc) throws IOException {
        final Content content = doc.resolveContent(contentId);
        if (content == null)
            throw new IOException("unable to resolve referenced content:" + contentId);
        PDImageXObject img = embedImage(doc, content);
        if (img != null) {
            Matrix m = new Matrix(this.width, 0, 0, this.height, doc.getXOffset() + this.x, doc.getYOffset() + this.y);
            doc.stream().drawImage(img, m);
        } else {
            drawSVG(doc, content.getFile().toURL());
        }
    }

    /**
     * @param document doc
     * @param content  content to embed
     * @return the embedded image object bound to the given doc
     * @throws IOException
     */
    private PDImageXObject embedImage(Document document, Content content) throws IOException {
        var type = content.getContentType();
        switch (type) {
            case "image/jpg":
            case "image/jpeg":
                return JPEGFactory.createFromStream(document, content.getInputStream());
            case "image/gif":
            case "image/bmp":
            case "image/png":
                return LosslessFactory.createFromImage(document, ImageIO.read(content.getInputStream()));
            case "image/svg+xml":
                return null;
            default:
                throw new IOException("unsupported image type: " + type);
        }
    }

    /**
     * draws svg files natively to the PDF thanks to svgSalamander
     * @param doc
     * @param file_url
     * @throws IOException
     */
    private void drawSVG(Document doc, java.net.URL file_url) throws IOException {
        SVGUniverse svgUniverse = new SVGUniverse();
        SVGDiagram diagram = svgUniverse.getDiagram(svgUniverse.loadSVG(file_url));

        var adjusted_matrix = Matrix.concatenate(
            Matrix.getTranslateInstance(doc.getXOffset() + this.x, doc.getYOffset() + this.y),
            Matrix.getScaleInstance(this.width / diagram.getWidth(), this.height / diagram.getHeight())
        );

        PdfBoxGraphics2D graphics = new PdfBoxGraphics2D(doc, diagram.getWidth(), diagram.getHeight());

        try {
            diagram.render(graphics);
        } catch (SVGException e) {
            e.printStackTrace();
        } finally {
            graphics.dispose();
        }

        var form = graphics.getXFormObject();
        form.setMatrix(adjusted_matrix.createAffineTransform());
        doc.stream().drawForm(form);

        //todo(Rennorb): @debug
        doc.stream().setLineWidth(1);
        doc.stream().moveTo(adjusted_matrix.getTranslateX(), adjusted_matrix.getTranslateY());
        doc.stream().lineTo(adjusted_matrix.getTranslateX() + diagram.getWidth(), adjusted_matrix.getTranslateY());
        doc.stream().lineTo(adjusted_matrix.getTranslateX() + diagram.getWidth(), adjusted_matrix.getTranslateY() + diagram.getHeight());
        doc.stream().lineTo(adjusted_matrix.getTranslateX(), adjusted_matrix.getTranslateY() + diagram.getHeight());
        doc.stream().closePath();
        doc.stream().stroke();
    }
}
