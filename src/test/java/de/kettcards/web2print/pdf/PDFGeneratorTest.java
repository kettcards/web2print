package de.kettcards.web2print.pdf;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import de.kettcards.web2print.model.db.CardFormat;
import de.kettcards.web2print.model.font.FontUtils;
import de.kettcards.web2print.serialize.CardDataDeserializer;
import de.kettcards.web2print.service.CardService;
import de.kettcards.web2print.service.FontService;
import de.kettcards.web2print.storage.Content;
import de.kettcards.web2print.storage.StorageContextAware;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.preflight.PreflightDocument;
import org.apache.pdfbox.preflight.exception.SyntaxValidationException;
import org.apache.pdfbox.preflight.parser.PreflightParser;
import org.junit.jupiter.api.*;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.util.FileSystemUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class PDFGeneratorTest {

    private static final Path outTestDirectory = Paths.get("test_output");

    private static final CardService cardService = mock(CardService.class);

    private static final FontService fontService = mock(FontService.class);

    private static final StorageContextAware storageContext = mock(StorageContextAware.class);

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private CardFormat cardFormatStub;

    private PDDocument document;

    public static void makeOutputPdf(CardData cardData, String filename) throws IOException {
        try (Document doc = new Document()) {
            doc.embedFontPackage(FontUtils.loadJosefineSlabPackage());
            doc.setUserContent(storageContext);
            cardData.apply(doc);
            String[] split = filename.split("\\.");
            var file = outTestDirectory.resolve(split[0] + ".pdf").toFile();
            doc.save(file);
            System.out.println("document saved: " + file.getAbsolutePath());
            validate(file);
        }
    }

    @BeforeAll
    public void beforeAll() throws IOException {
        SimpleModule simpleModule = new SimpleModule();
        //TODO card data serializer
        simpleModule.addDeserializer(CardData.class, new CardDataDeserializer(cardService));
        objectMapper.registerModule(simpleModule);
        FileSystemUtils.deleteRecursively(outTestDirectory);
        Files.createDirectories(outTestDirectory);
    }

    @BeforeEach
    public void beforeEach() throws IOException {
        //mock card format
        when(cardService.findCardFormat(anyString())).thenAnswer(s -> {
            var stub = new CardFormat();
            String argument = s.getArgument(0, String.class);
            try {
                // if card name is NxN, the page layout will have the same dimensions
                final String[] xes = argument.split("x");
                stub.setWidth(Integer.parseInt(xes[0]));
                stub.setHeight(Integer.parseInt(xes[1]));
            } catch (Exception ex) {
                stub.setWidth(800);
                stub.setHeight(600);
            }
            cardFormatStub = stub;
            return stub;
        });
        when(storageContext.load(anyString())).thenAnswer(s -> {
            final Content content = new Content(new FileSystemResource("src/test/resources/testImages/smaller.jpg"), "jpg");

            return content;
        });

        document = new PDDocument();
    }

    @AfterEach
    public void afterEach() throws IOException {
        document.close();
    }

    /**
     * validates pdf file
     * @param file pdf file
     * @throws IOException if pdf file is not even readable
     */
    public static void validate(File file) throws IOException {
        PreflightParser parser = new PreflightParser(file);
        try {
            parser.parse();
            PreflightDocument document = parser.getPreflightDocument();
            document.validate();
            document.close();
        } catch (SyntaxValidationException e) {
            fail(e.getCause());
        }
    }

    @TestFactory
    public List<DynamicTest> generatePDF() throws IOException {
        var ret = new LinkedList<DynamicTest>();
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources("classpath:/test_data/pdfGen/validCardData/{filename:[^_]*.json}");
        for (var resource : resources) {
            var name = resource.getFilename();
            DynamicTest dynamicTest = DynamicTest.dynamicTest(name, () -> {
                CardData cardData = objectMapper.readValue(resource.getInputStream(), CardData.class);
                makeOutputPdf(cardData, name);
            });
            ret.add(dynamicTest);
        }
        return ret;
    }

}
