package api.app.astrodao.com.core.dto.api.dao;

import lombok.Data;

import java.util.List;

@Data
public class Metadata {
	private String flag;
	private String displayName;
	private List<Object> links;
}