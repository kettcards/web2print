package de.kettcards.web2print.web;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Deprecated
@RestController
@RequestMapping("${web2print.links.api-path}/motive")
public class MotiveController {
    /*
    @Autowired
    private ImportService importService;

    @Autowired
    private MotiveRepository motiveRepository;

    @Autowired
    private MotiveScaleService motiveScaleService;

    //TODO move that somewhere else
    private Path baseDir;

    @PostConstruct
    public void init() throws IOException {
        baseDir = Files.createTempDirectory("w2p_motives_raw");
    }

    @GetMapping
    public ResponseEntity<byte[]> getMotive(@RequestBody String motiveRequest) { //name of the image, motive files should be served static
        Path path = baseDir.resolve(motiveRequest);
        try {
            return ResponseEntity.ok(Files.readAllBytes(path));
        } catch (IOException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

     */

}
