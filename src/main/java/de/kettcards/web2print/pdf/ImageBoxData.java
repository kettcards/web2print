package de.kettcards.web2print.pdf;

import com.kitfox.svg.SVGDiagram;
import com.kitfox.svg.SVGException;
import com.kitfox.svg.SVGUniverse;
import com.kitfox.svg.xml.NumberWithUnits;
import de.kettcards.web2print.storage.Content;
import de.rototor.pdfbox.graphics2d.PdfBoxGraphics2D;
import lombok.extern.slf4j.*;
import org.apache.pdfbox.pdmodel.graphics.image.JPEGFactory;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.util.Matrix;

import javax.imageio.ImageIO;
import java.io.IOException;

/**
 * image node representation
 */
@Slf4j
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

    float convert_number(NumberWithUnits input, float ppi)
    {
        float value = input.getValue();
        switch(input.getUnits())
        {
            case NumberWithUnits.UT_PX      : break;
            case NumberWithUnits.UT_UNITLESS: break;

            case NumberWithUnits.UT_PC      : value *= 12;
            case NumberWithUnits.UT_PT      : value /= 72;
            case NumberWithUnits.UT_IN      : value *= ppi; break;

            case NumberWithUnits.UT_MM      : value /= 10;
            case NumberWithUnits.UT_CM      : value = value / 2.54f * ppi; break;

            case NumberWithUnits.UT_EM      :
            case NumberWithUnits.UT_EX      :
            case NumberWithUnits.UT_PERCENT : log.warn("cant handle NumberWithUnits unit {}", input.getUnits()); break;
        }
        return value;
    }

    /**
     * draws svg files natively to the PDF thanks to svgSalamander
     */
    private void drawSVG(Document doc, java.net.URL file_url) throws IOException {
        SVGUniverse      svgUniverse = new SVGUniverse();
        SVGDiagram       diagram     = svgUniverse.getDiagram(svgUniverse.loadSVG(file_url));
        PdfBoxGraphics2D graphics    = new PdfBoxGraphics2D(doc, diagram.getWidth(), diagram.getHeight());

        try {
            diagram.render(graphics);
        } catch (SVGException e) {
            e.printStackTrace();
        } finally {
            graphics.dispose();
        }

        float width_render, height_render;
        try {
            var root = diagram.getRoot();
            var field_width  = root.getClass().getDeclaredField("width");
            var field_height = root.getClass().getDeclaredField("height");
            field_width .setAccessible(true);
            field_height.setAccessible(true);
            var number_width  = (NumberWithUnits)field_width .get(root);
            var number_height = (NumberWithUnits)field_height.get(root);
            // TODO(Rennorb): dont hardcode ppi
            width_render  = convert_number(number_width , 96);
            height_render = convert_number(number_height, 96);
        } catch (Throwable ignore) {
            log.warn("failed to get fields from svg root");
            width_render  = this.width;
            height_render = this.height;
        }

        var scale_render_y = this.height / height_render;
        var translate_matrix = Matrix.getTranslateInstance( this.x + doc.getXOffset(), this.y + doc.getYOffset()
                //NOTE(Rennorb): this is just for correcting the scale origin
                + (height_render - this.height) * scale_render_y
        );
        var scale_matrix = Matrix.getScaleInstance(this.width / width_render, scale_render_y);
        var matrix = Matrix.concatenate(translate_matrix, scale_matrix);

        var form = graphics.getXFormObject();
        form.setMatrix(matrix.createAffineTransform());
        doc.stream().drawForm(form);
    }
}
