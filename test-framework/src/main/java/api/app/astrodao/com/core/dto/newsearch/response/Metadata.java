package api.app.astrodao.com.core.dto.newsearch.response;

import lombok.Data;

import java.util.List;

@Data
public class Metadata {
	private String displayName;
	private Legal legal;
	private String flagLogo;
	private List<Object> links;
	private String flagCover;
}