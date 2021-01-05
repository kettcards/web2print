package de.kettcards.web2print.model.fonts;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;

import java.util.List;

@Data
public class FontPackage {

    private String name;

    private List<Faces> faces;

    @Data
    public static class Faces {

        private Integer v;

        private String fs;

        private Integer fw;

        private String s;

    }

    public static void main(String[] args) {
        FontPackage fontPackage = new FontPackage();
        fontPackage.setName("test");
        Faces faces = new Faces();
        //new ObjectMapper().writeValueAsString()
    }


}
