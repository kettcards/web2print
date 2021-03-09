package de.kettcards.web2print.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.kettcards.web2print.service.MotiveImportService;
import de.kettcards.web2print.service.XlsxImportService;
import de.kettcards.web2print.storage.Content;
import de.kettcards.web2print.storage.contraint.MediaTypeFileExtensionFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("${web2print.links.api-path}/import")
public final class ImportController {

    @Autowired
    private XlsxImportService xlsxImportService;

    @Autowired
    private MotiveImportService motiveImportService;

    @Autowired
    private ObjectMapper objectMapper;

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
        motiveImportService.NEWImportMotive(Content.from(file), cards, null);
    }

    @PostMapping(value = "/motive/front", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public void importFrontMotive(@RequestPart(value = "cards", required = false) String json,
                             @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
        var cards = objectMapper.readValue(json, new TypeReference<List<String>>() {});
        Content.from(file).assertContentExtension(MediaTypeFileExtensionFilter.BITMAP);
        var fileExtension = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf('.'));
    }

    @PostMapping(value = "/motive/back", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public void importBackMotive(@RequestPart(value = "cards", required = false) String cards,
                                  @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
        System.out.println("okey");
        System.out.println(cards);
        System.out.println(file.getOriginalFilename());
    }

}
