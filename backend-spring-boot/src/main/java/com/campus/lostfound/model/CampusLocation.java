package com.campus.lostfound.model;

public class CampusLocation {
    private Long id;
    private String name;
    private String campusZone;
    private String description;

    public CampusLocation() {}
    public CampusLocation(Long id, String name, String campusZone, String description) {
        this.id = id;
        this.name = name;
        this.campusZone = campusZone;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCampusZone() { return campusZone; }
    public void setCampusZone(String campusZone) { this.campusZone = campusZone; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
