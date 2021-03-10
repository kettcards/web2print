package de.kettcards.web2print.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.kettcards.web2print.service.MotiveImportService;
import de.kettcards.web2print.service.XlsxImportService;
import de.kettcards.web2print.storage.Content;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("${web2print.links.api-path}/import")
public final class ImportController {

    private final XlsxImportService xlsxImportService;

    private final MotiveImportService motiveImportService;

    private final ObjectMapper objectMapper;

    public ImportController(XlsxImportService xlsxImportService,
                            MotiveImportService motiveImportService,
                            ObjectMapper objectMapper) {
        this.xlsxImportService = xlsxImportService;
        this.motiveImportService = motiveImportService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/table")
    public void importTable(@RequestParam("file") MultipartFile file) throws IOException {
        xlsxImportService.importCards(file.getInputStream());
    }

    @PostMapping("/defaultMotive/{id}")
    public void importDefaultMotive(@PathVariable int id,
                                    @RequestParam("file") MultipartFile file) throws IOException {
        motiveImportService.importDefaultMotive(Content.from(file), id);
    }


    @PostMapping(value = "/motive", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public void importMotive(@RequestPart(value = "cards", required = false) String json,
                             @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
        //TODO pre parsing
        var cards = objectMapper.readValue(json, new TypeReference<List<String>>() {});
        motiveImportService.importMotive(Content.from(file), cards, null);
    }

    @PostMapping(value = "/motive/front", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public void importFrontMotive(@RequestPart(value = "cards", required = false) String json,
                             @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
        //TODO pre parsing
        var cards = objectMapper.readValue(json, new TypeReference<List<String>>() {});
        motiveImportService.importMotive(Content.from(file), cards, "FRONT");

    }

    @PostMapping(value = "/motive/back", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public void importBackMotive(@RequestPart(value = "cards", required = false) String json,
                                  @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
        //TODO pre parsing
        var cards = objectMapper.readValue(json, new TypeReference<List<String>>() {});
        motiveImportService.importMotive(Content.from(file), cards, "BACK");
    }

}
