package de.kettcards.web2print.service;

import de.kettcards.web2print.exceptions.importer.DatabaseEntryNotFoundException;
import de.kettcards.web2print.model.db.Card;
import de.kettcards.web2print.model.db.CardFormat;
import de.kettcards.web2print.model.db.Motive;
import de.kettcards.web2print.model.db.rel.MotiveMap;
import de.kettcards.web2print.repository.CardFormatRepository;
import de.kettcards.web2print.repository.CardRepository;
import de.kettcards.web2print.repository.MotiveMapRepository;
import de.kettcards.web2print.repository.MotiveRepository;
import de.kettcards.web2print.storage.Content;
import de.kettcards.web2print.storage.StorageContextAware;
import de.kettcards.web2print.storage.WebContextAware;
import de.kettcards.web2print.storage.contraint.MediaTypeFileExtension;
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

    private static final String defaultPrefix = "default/";

    private final MotiveRepository motiveRepository;

    private final MotiveMapRepository motiveMapRepository;

    private final CardRepository cardRepository;

    private final CardFormatRepository cardFormatRepository;

    public MotiveImportService(MotiveRepository motiveRepository,
                               MotiveMapRepository motiveMapRepository,
                               CardRepository cardRepository,
                               CardFormatRepository cardFormatRepository) {
        this.motiveRepository = motiveRepository;
        this.motiveMapRepository = motiveMapRepository;
        this.cardRepository = cardRepository;
        this.cardFormatRepository = cardFormatRepository;
    }

    public void importMotive(Content content) throws IOException {
        String name = content.getOriginalFilename();
        log.info("importing " + name);
        int lastDotIndex = name.lastIndexOf(".");
        String extension = name.substring(lastDotIndex);
        name = name.substring(0, lastDotIndex);
        Card card = cardRepository.findCardByOrderId(name);

        if (MediaTypeFileExtension.PDF.isValidFileExtension(extension)) {
            float scaleFactor = getScaleFactor();
            List<ByteArrayOutputStream> outputStreams = printPdfToImage(content.getInputStream(), scaleFactor);
            for (int i = 0; i < outputStreams.size(); i++) {
                String out;
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
                        throw new IOException("unexpected page for document \"" + name + "\"");
                }
                try {
                    save(new Content(new InMemoryResource(stream.toByteArray())), out);
                } catch (IOException exception) {
                    throw new IOException("failed to save " + name);
                }
            }
        } else {
            //TODO: implement JPG(probably convert to PNG and also image quality probably not good enough for
            // pdf generator), PNG
            throw new IllegalArgumentException("Importing PNG and JPG (" + name + ")isn't implemented yet.");
        }
        return "200";
    }

    public void importDefaultMotive(Content content) throws IOException {
        String originalFilename = content.getOriginalFilename();
        int lastDotIndex = originalFilename.lastIndexOf('.');
        String id = originalFilename.substring(0, lastDotIndex);
        String extension = originalFilename.substring(lastDotIndex);
        var format = cardFormatRepository.findById(Integer.parseInt(id)).orElseThrow();

        if (MediaTypeFileExtension.PDF.isValidFileExtension(extension)) {
            try {
                var streams = printPdfToImage(content.getInputStream(), getScaleFactor());
                if (streams.get(0) != null) {
                    saveDefaultFormat(format, streams.get(0), "-front.png");
                }

                if (streams.get(1) != null) {
                    saveDefaultFormat(format, streams.get(1), "-back.png");
                }
                save(content, defaultPrefix.concat(originalFilename));
            } catch (IOException exception) {
                throw new IOException("500: encountered IOException while importing " + originalFilename);
            }
        } else {
            //TODO: implement JPG(probably convert to PNG and also image quality probably not good enough for
            // pdf generator), PNG
            throw new IllegalArgumentException("Importing PNG and JPG (" + originalFilename + ")isn't implemented yet.");
        }
        Motive motive = new Motive();
        motive.setTextureSlug(originalFilename);

    }

    private void saveDefaultFormat(CardFormat cardFormat, ByteArrayOutputStream stream, String suffix) throws IOException {
        if (stream != null) {
            var name = defaultPrefix + cardFormat.getId() + suffix;
            save(new Content(new InMemoryResource(stream.toByteArray())), name);
            Motive motive = new Motive();
            motive.setTextureSlug(name);
            cardFormat.setDefaultFrontMotive(motive);
            cardFormatRepository.save(cardFormat);
        }
    }


    private void updateDatabase(String motiveName, Card card, String side) throws DatabaseEntryNotFoundException {
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
            throw new DatabaseEntryNotFoundException("couldn't map " + motiveName + " to a card because there is no database entry for it");
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
