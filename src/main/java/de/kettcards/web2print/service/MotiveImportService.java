package de.kettcards.web2print.service;

import de.kettcards.web2print.model.db.Card;
import de.kettcards.web2print.model.db.Motive;
import de.kettcards.web2print.model.db.rel.MotiveMap;
import de.kettcards.web2print.repository.CardRepository;
import de.kettcards.web2print.repository.MotiveMapRepository;
import de.kettcards.web2print.repository.MotiveRepository;
import de.kettcards.web2print.storage.Content;
import de.kettcards.web2print.storage.StorageContextAware;
import de.kettcards.web2print.storage.WebContextAware;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.security.util.InMemoryResource;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedList;
import java.util.List;

@Slf4j
@Component
public class MotiveImportService extends StorageContextAware implements WebContextAware {

    private final MotiveRepository motiveRepository;

    private final MotiveMapRepository motiveMapRepository;

    private final CardRepository cardRepository;

    public MotiveImportService(MotiveRepository motiveRepository,
                               MotiveMapRepository motiveMapRepository,
                               CardRepository cardRepository) {
        this.motiveRepository = motiveRepository;
        this.motiveMapRepository = motiveMapRepository;
        this.cardRepository = cardRepository;
    }

    public String importMotive(Content content) {
        String name = content.getOriginalFilename();
        log.info("importing " + name);
        int lastDotIndex = name.lastIndexOf(".");
        name = name.substring(0, lastDotIndex);

        try {
            Card card = cardRepository.findCardByOrderId(name);
            float scaleFactor = getScaleFactor();
            List<ByteArrayOutputStream> outputStreams = printPdfToImage(content.getInputStream(), scaleFactor);
            for (int i = 0; i < outputStreams.size(); i++) {
                String out = null;
                ByteArrayOutputStream stream = outputStreams.get(i);
                if (stream.size() == 0)
                    continue;
                switch (i) {
                    case 0:
                        out = name + "-front.png";
                        updateDatabase(out, card, "FRONT");
                        break;
                    case 1:
                        out = name + "-back.png";
                        updateDatabase(out, card, "BACK");
                        break;
                    default:
                        log.warn("unexpected page for document \"" + name + "\"");
                }
                if (out == null)
                    continue;
                save(new Content(new InMemoryResource(stream.toByteArray())), out);
            }

        } catch (IOException e) {
            log.warn("unable to save motive \"" + name + "\"");
            return "500";
        }
        return "200";
    }

    private void updateDatabase(String motiveName, Card card, String side) {
        Motive frontMotive = new Motive();
        frontMotive.setTextureSlug(motiveName);

        Motive motive;
        if (motiveRepository.existsMotiveByTextureSlug(motiveName)) {
            motive = motiveRepository.findByTextureSlug(motiveName);
        } else {
            motive = motiveRepository.save(frontMotive);
        }

        if (card != null) {
            MotiveMap map = new MotiveMap();
            map.setMotive(motive);
            map.setSide(side);
            map.setCard(card);
            MotiveMap.MotiveMapId mapId = new MotiveMap.MotiveMapId();
            mapId.setMotive(motive.getId());
            mapId.setCard(card.getId());
            map.setMotiveMapId(mapId);
            motiveMapRepository.save(map);
        } else {
            log.warn("couldn't map " + motiveName + " to a card because there is no database entry for it");
        }
    }


    @Override
    public String getNamespace() {
        return "motives";
    }

    public float getScaleFactor() {
        return 1.0f; //TODO make configurable
    }

    /**
     * @param inputStream pdf input
     * @param scaleFactor scale factor for image resolution
     * @return list of images (as stream) in png format for each page
     * @throws IOException
     */
    public List<ByteArrayOutputStream> printPdfToImage(InputStream inputStream, float scaleFactor) throws IOException {
        var listOut = new LinkedList<ByteArrayOutputStream>();
        try (PDDocument document = PDDocument.load(inputStream)) {
            for (int i = 0; i < document.getNumberOfPages(); i++) {
                PDPage page = document.getPage(i);
                page.setMediaBox(page.getTrimBox());
            }
            PDFRenderer renderer = new PDFRenderer(document);
            for (int i = 0; i < document.getNumberOfPages(); i++) {
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                BufferedImage bufferedImage = renderer.renderImage(i, scaleFactor, ImageType.ARGB);
                ImageIO.write(bufferedImage, "png", outputStream);
                listOut.add(outputStream);
            }
        }
        return listOut;
    }
}
