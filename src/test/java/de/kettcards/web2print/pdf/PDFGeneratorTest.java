package de.kettcards.web2print.pdf;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import de.kettcards.web2print.model.db.CardFormat;
import de.kettcards.web2print.model.font.FontUtils;
import de.kettcards.web2print.pdf.textBox.LeftAlignedTextBoxData;
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
import org.junit.jupiter.api.function.Executable;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.util.FileSystemUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class PDFGeneratorTest {

    private static final Path outTestDirectory = Paths.get("test_output");

    private static final CardService cardService = mock(CardService.class);

    private static final FontService fontService = mock(FontService.class);

    private static final StorageContextAware storageContext = mock(StorageContextAware.class);

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private CardFormat cardFormatStub;

    private static final PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
    private Document document;

    @BeforeAll
    public static void beforeAll() throws IOException {
        SimpleModule simpleModule = new SimpleModule();
        simpleModule.addDeserializer(CardData.class, new CardDataDeserializer(cardService));
        objectMapper.registerModule(simpleModule);

        FileSystemUtils.deleteRecursively(outTestDirectory);
        Files.createDirectories(outTestDirectory);
    }

    public void makePdf(CardData cardData, String fileName) throws Throwable {
        makePdf(cardData, fileName, () -> {
        });
    }

    public void makePdf(CardData cardData, String fileName, Executable t) throws Throwable {

        assertDoesNotThrow(() -> {
            document.embedFontPackage(FontUtils.loadJosefineSlabPackage());
            document.setUserContent(storageContext);
            cardData.apply(document);
        });
        t.execute();
        try {
            var file = outTestDirectory.resolve(fileName).toFile();
            document.save(file);
            System.out.println("document saved: " + file.getAbsolutePath());
            validate(file);
        } catch (IOException ex) {
            fail(ex);
        }
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
                stub.setWidth(210);
                stub.setHeight(297);
            }
            cardFormatStub = stub;
            return stub;
        });
        when(storageContext.load(anyString())).thenAnswer(s -> {
            final Content content = new Content(new FileSystemResource("src/test/resources/testImages/smaller.jpg"), "jpg");

            return content;
        });

        document = new Document();
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
    public List<DynamicTest> generateFromValidCardData() throws IOException {
        var source = "classpath:/de/kettcards/web2print/pdf/validCardData/{filename:[^_]*.json}";
        var ret = new LinkedList<DynamicTest>();
        Resource[] resources = resolver.getResources(source);
        for (var resource : resources) {
            var filename = resource.getFilename();
            var name = filename.substring(0, filename.lastIndexOf('.'));
            ret.add(DynamicTest.dynamicTest(name, () -> {
                beforeEach();
                var cardData = objectMapper.readValue(resource.getInputStream(), CardData.class);
                makePdf(cardData, name.concat(".pdf"));
                afterEach();
            }));
            ret.add(DynamicTest.dynamicTest(name.concat("_grid"), () -> {
                beforeEach();
                var cardData = objectMapper.readValue(resource.getInputStream(), CardData.class);
                makePdf(cardData, name.concat("_grid.pdf"), () -> PDFUtils.drawGrid(document));
                afterEach();
            }));
            ret.add(DynamicTest.dynamicTest(name.concat("_outlined"), () -> {
                beforeEach();
                var c = objectMapper.readValue(resource.getInputStream(), CardData.class);
                makePdf(PDFUtils.enableBoxOutline(document, c), name.concat("_outlined.pdf"));
                afterEach();
            }));
            ret.add(DynamicTest.dynamicTest(name.concat("_outlined_grid"), () -> {
                beforeEach();
                var c = objectMapper.readValue(resource.getInputStream(), CardData.class);
                makePdf(PDFUtils.enableBoxOutline(document, c), name.concat("_outlined_grid.pdf"), () -> {
                    PDFUtils.drawGrid(document);
                });
                afterEach();
            }));
        }
        return ret;
    }

    @Test
    public void emptyPageOnOutside() throws IOException {
        PDDocument generate;
        PDDocument generate1 = new PDFGenerator(null, null).generate(PDFUtils.emptyCardData);
        assertEquals(1, generate1.getNumberOfPages());
        var hasOutsideElement = new CardData(0, 0, Collections.emptyList(),
                Collections.singletonList(new LeftAlignedTextBoxData(0, 0, 0, 0, Collections.emptyList())));
        generate1.close();
        PDDocument generate2 = new PDFGenerator(null, null).generate(hasOutsideElement);
        assertEquals(2, generate2.getNumberOfPages());

    }

}
